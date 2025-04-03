import trafilatura


def get_website_text_content(url: str) -> str:
    """
    This function takes a url and returns the main text content of the website.
    The text content is extracted using trafilatura and easier to understand.
    The results are better for summarization by LLM before consumption by the user.

    Args:
        url: The URL of the website to scrape

    Returns:
        str: The extracted text content from the website
    """
    # Send a request to the website
    downloaded = trafilatura.fetch_url(url)
    text = trafilatura.extract(downloaded)
    return text if text else "No content could be extracted from the provided URL."