import base64
import email
from email.header import decode_header
import re
from typing import Any, Optional
from bs4 import BeautifulSoup

class EmailParser:
    @staticmethod
    def clean_subject(raw_subject: Optional[str]) -> str:
        if not raw_subject:
            return "(No Subject)"
        try:
            decoded_parts = decode_header(raw_subject)
            result = []
            for text, encoding in decoded_parts:
                if isinstance(text, bytes):
                    result.append(text.decode(encoding or "utf-8", errors="replace"))
                else:
                    result.append(str(text))
            return "".join(result).strip()
        except Exception:
            return raw_subject.strip()

    @staticmethod
    def parse_sender(from_header: Optional[str]) -> tuple[str, str]:
        if not from_header:
            return "Unknown Sender", "unknown@example.com"
        
        # Matches: "John Doe <john@example.com>" or just "john@example.com"
        match = re.match(r"^(.*?)\s*<([^>]+)>$", from_header.strip())
        if match:
            name = match.group(1).strip().strip('"').strip("'")
            email_addr = match.group(2).strip().lower()
            return name or email_addr.split("@")[0], email_addr
        
        email_addr = from_header.strip().lower()
        name = email_addr.split("@")[0] if "@" in email_addr else email_addr
        return name, email_addr

    @staticmethod
    def clean_html_body(html_content: str) -> tuple[str, bool]:
        """
        Cleans HTML to readable plain text and checks for tracking pixels.
        Returns: (plain_text, has_tracking_pixel)
        """
        if not html_content:
            return "", False

        try:
            soup = BeautifulSoup(html_content, "html.parser")
            
            # Detect tracking pixels (1x1 images, hidden tracking beacons)
            has_tracking_pixel = False
            for img in soup.find_all("img"):
                width = str(img.get("width", "")).strip()
                height = str(img.get("height", "")).strip()
                src = str(img.get("src", "")).lower()
                
                if (width in ("1", "0") and height in ("1", "0")) or \
                   any(tracker in src for tracker in ("track", "pixel", "beacon", "open.aspx", "mailtrack")):
                    has_tracking_pixel = True
                    img.decompose()

            # Remove scripts, styles, and comments
            for tag in soup(["script", "style", "meta", "noscript"]):
                tag.decompose()

            text = soup.get_text(separator="\n")
            # Collapse repeated blank lines
            cleaned_text = re.sub(r"\n\s*\n+", "\n\n", text).strip()
            return cleaned_text, has_tracking_pixel
        except Exception:
            # Fallback simple tag stripper
            cleaned = re.sub(r"<[^>]+>", " ", html_content)
            return re.sub(r"\s+", " ", cleaned).strip(), False

    @staticmethod
    def extract_unsubscribe_url(headers: dict[str, str], body_text: str) -> Optional[str]:
        # Check standard List-Unsubscribe header
        list_unsub = headers.get("List-Unsubscribe", "")
        if list_unsub:
            url_match = re.search(r"<(https?://[^>]+)>", list_unsub)
            if url_match:
                return url_match.group(1)
        
        # Check body text for unsubscribe links
        body_unsub = re.search(r"(https?://[^\s\"'>]+(?:unsubscribe|opt-out|manage-preferences)[^\s\"'>]*)", body_text, re.IGNORECASE)
        if body_unsub:
            return body_unsub.group(1)
        
        return None

    @classmethod
    def decode_gmail_payload(cls, payload: dict[str, Any]) -> str:
        """
        Recursively decodes a Gmail API message payload dictionary.
        """
        body_data = ""
        mime_type = payload.get("mimeType", "")
        
        if "parts" in payload:
            for part in payload["parts"]:
                part_mime = part.get("mimeType", "")
                if part_mime == "text/plain":
                    return cls._decode_base64(part.get("body", {}).get("data", ""))
                elif part_mime == "text/html":
                    body_data = cls._decode_base64(part.get("body", {}).get("data", ""))
                elif "parts" in part:
                    nested = cls.decode_gmail_payload(part)
                    if nested:
                        return nested

        if not body_data and "body" in payload and "data" in payload["body"]:
            body_data = cls._decode_base64(payload["body"]["data"])

        if mime_type == "text/html" or "<html" in body_data.lower():
            plain, _ = cls.clean_html_body(body_data)
            return plain

        return body_data

    @staticmethod
    def _decode_base64(data_str: str) -> str:
        if not data_str:
            return ""
        try:
            # Gmail uses URL-safe base64
            padded = data_str + "=" * (-len(data_str) % 4)
            decoded_bytes = base64.urlsafe_b64decode(padded)
            return decoded_bytes.decode("utf-8", errors="replace")
        except Exception:
            return ""

email_parser = EmailParser()
