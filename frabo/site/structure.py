from bs4 import BeautifulSoup

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")

def print_tree(tag, indent=0):
    if tag.name is not None:
        print(" " * indent + f"<{tag.name}>")
        for child in tag.children:
            print_tree(child, indent + 2)

print_tree(soup.body)
