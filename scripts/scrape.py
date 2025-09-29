import re, json, urllib.parse, requests
from bs4 import BeautifulSoup, NavigableString

SECTION_KEYS = {
    "major_in": re.compile(r"^\s*major in\b", re.I),
    "acs_major": re.compile(r"^\s*acs.*major", re.I),
    "major_for_ed": re.compile(r"^\s*major\s+for\b.*education", re.I),
    "minor_in": re.compile(r"^\s*minor in\b", re.I),
    "gpa_note": re.compile(r"^\s*grade point average notation", re.I),
}

def norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())

def extract_catalog_year(text: str):
    m = re.search(r"\b(20\d{2}-\d{2})\s*catalog\b", text, re.I)
    return m.group(1) if m else None

def first_text(el) -> str:
    return norm(el.get_text(" ", strip=True)) if el else ""

def split_lines_preserve_br(p_tag):
    # Turn <br> into line breaks, then split
    txt = p_tag.get_text("\n", strip=True)
    lines = [l.strip() for l in txt.split("\n") if l.strip()]
    return lines

def parse_faculty(paragraphs):
    faculty = []
    for p in paragraphs:
        # Each person tends to be: "NAME, Title" then a <br> then degrees.
        lines = split_lines_preserve_br(p)
        if not lines:
            continue
        first = lines[0]
        deg = lines[1] if len(lines) > 1 else None

        # NAME, Title
        if "," in first:
            name, title = first.split(",", 1)
        else:
            # Fallback: last ALL CAPS words are name; else whole line is title
            caps = re.findall(r"[A-Z][A-Z' .-]+", first)
            name = caps[0].strip() if caps else first
            title = first[len(name):].strip(" ,") if caps else None

        faculty.append({
            "name": norm(name),
            "title": norm(title),
            "degrees": norm(deg)
        })
    return faculty

def classify_header(strong_text: str):
    t = norm(strong_text)
    for key, rx in SECTION_KEYS.items():
        if rx.search(t):
            return key
    # Catch-all for other bold prefaces (e.g., “Courses (CHEM)”, etc.)
    if re.search(r"^courses\b", t, re.I):
        return "courses_hdr"
    return None

def strip_strong_prefix(p):
    """Return the paragraph text with the first <strong> removed from the front, if present."""
    p_clone = BeautifulSoup(str(p), "html.parser")  # lightweight clone
    st = p_clone.find("strong")
    if st:
        # Only remove if it’s at the beginning
        prefix = st.get_text(" ", strip=True)
        full = p_clone.get_text(" ", strip=True)
        return norm(re.sub(r"^\s*" + re.escape(prefix) + r"\s*[:.-]?\s*", "", full, flags=re.I))
    return first_text(p)

def parse_requirements(paragraphs):
    """
    Walk through <p> tags; when a <strong> header appears, capture its content.
    Accumulate any following <p> without new <strong> as continuation until the next header.
    """
    result = {
        "major_in": None,
        "acs_major": None,
        "major_for_ed": None,
        "minor_in": None,
        "gpa_note": None,
        "other_sections": {}
    }

    current_key = None
    buffer = []

    def flush():
        nonlocal buffer, current_key
        if current_key and buffer:
            text = norm(" ".join(buffer))
            if current_key in result:
                result[current_key] = text if not result[current_key] else (result[current_key] + " " + text)
            else:
                result["other_sections"][current_key] = text
        buffer = []

    for p in paragraphs:
        st = p.find("strong")
        if st:
            # New section
            flush()
            current_key = classify_header(st.get_text(" ", strip=True))
            content = strip_strong_prefix(p)
            if content:
                buffer.append(content)
        else:
            # Continuation or preface (faculty lives before the first header; caller decides)
            if current_key:
                buffer.append(first_text(p))

    flush()
    return result

def find_courses_endpoint(soup, page_url=None):
    # Most pages include: <script src="https://www.augustana.net/prebuilt/catalog/courselist.php?area=chem">
    sc = soup.find("script", src=lambda s: s and "courselist.php" in s)
    if not sc:
        return None
    src = sc["src"]
    if page_url:
        return urllib.parse.urljoin(page_url, src)
    return src

def fetch_courses_html(courses_url, timeout=20):
    try:
        r = requests.get(courses_url, timeout=timeout)
        r.raise_for_status()
        return r.text
    except Exception as e:
        return f"<!-- failed to fetch courses: {e} -->"

def parse_augustana_major(html: str, page_url: str = None, fetch_courses=False):
    soup = BeautifulSoup(html, "html.parser")

    # Title
    title = first_text(soup.select_one("h1, h1 span"))
    if not title:
        # fallback to og:title
        ogt = soup.find("meta", attrs={"property": "og:title"})
        title = ogt["content"] if ogt and ogt.get("content") else None

    # Grab the main rich-text block that usually holds year, faculty, and requirements
    block = soup.select_one(".paragraph--type--text")
    catalog_year = extract_catalog_year(block.get_text(" ", strip=True) if block else soup.get_text(" ", strip=True))

    paragraphs = block.select("p") if block else []

    # Split into: (preface/faculty) until the first strong, then requirements
    preface_ps, req_ps = [], []
    seen_header = False
    for p in paragraphs:
        if not seen_header and p.find("strong"):
            seen_header = True
        (req_ps if seen_header else preface_ps).append(p)

    # Faculty lives in the preface; but some preface lines are just the year
    # Filter out the year-only paragraph
    preface_ps_clean = []
    for p in preface_ps:
        if extract_catalog_year(p.get_text(" ", strip=True)):
            continue
        preface_ps_clean.append(p)

    faculty = parse_faculty(preface_ps_clean)
    requirements = parse_requirements(req_ps)

    courses_url = find_courses_endpoint(soup, page_url=page_url)
    courses_html = fetch_courses_html(courses_url) if (courses_url and fetch_courses) else None

    return {
        "program_title": title,
        "catalog_year": catalog_year,
        "page_url": page_url,
        "faculty": faculty,  # list of {name, title, degrees}
        "requirements": requirements,  # dict with major_in, acs_major, major_for_ed, minor_in, gpa_note
        "courses_endpoint": courses_url,
        "courses_html": courses_html,  # only if fetch_courses=True
    }

# ---------- example ----------
# result = parse_augustana_major(open("chemistry.html").read(),
#                                page_url="https://augustana.edu/academics/areas-of-study/chemistry/courses",
#                                fetch_courses=True)
# print(json.dumps(result, indent=2))
