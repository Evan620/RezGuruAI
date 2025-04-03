import trafilatura
import re
import json
from typing import Dict, List, Any, Tuple, Optional
from urllib.parse import urlparse

class WebScraper:
    """Advanced web scraper with content extraction and parsing capabilities"""
    
    def __init__(self):
        """Initialize the WebScraper instance"""
        # Common property patterns for real estate
        self.property_patterns = {
            'address': r'\b\d+\s+[A-Za-z0-9\s,]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Ln|Rd|Blvd|Dr|St)\.?(?:\s+[A-Za-z]+)?\b',
            'price': r'\$\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?',
            'sqft': r'\b\d{3,5}\s*(?:sq\.?(?:\s*ft\.?)?|square\s*fe?e?t)\b',
            'beds': r'\b\d{1,2}\s*(?:bed|bedroom)s?\b',
            'baths': r'\b\d{1,2}(?:\.\d)?(?:\+)?\s*(?:bath|bathroom)s?\b'
        }

    def extract_content(self, url: str) -> Dict[str, Any]:
        """
        Extract and structure content from a URL
        
        Args:
            url: The URL to scrape
            
        Returns:
            Dict containing the extracted text, metadata, and structured data
        """
        # Extract domain for context
        domain = self._extract_domain(url)
        
        # Get raw content
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            raise Exception(f"Failed to download content from {url}")
            
        # Extract main text content
        text_content = trafilatura.extract(downloaded)
        
        # Extract HTML metadata
        metadata = trafilatura.extract_metadata(downloaded)
        
        # Extract structured data
        structured_data = self._extract_structured_data(text_content, url, domain)
        
        return {
            "text": text_content,
            "metadata": metadata.__dict__ if metadata else {},
            "structured_data": structured_data,
            "domain": domain,
            "url": url
        }
    
    def extract_real_estate_properties(self, content: str) -> List[Dict[str, Any]]:
        """
        Extract potential real estate property details from content
        
        Args:
            content: The text content to parse
            
        Returns:
            List of dictionaries containing property details
        """
        properties = []
        
        # Split content into potential listing chunks
        # Look for paragraph or section breaks
        chunks = re.split(r'\n\s*\n|\.\s+(?=[A-Z])', content)
        
        for chunk in chunks:
            if len(chunk.strip()) < 50:  # Skip very short chunks
                continue
                
            # Look for property identifiers in this chunk
            property_data = {}
            
            # Extract address
            address_match = re.search(self.property_patterns['address'], chunk, re.IGNORECASE)
            if address_match:
                property_data['address'] = address_match.group(0).strip()
                
                # Extract price near the address
                context = chunk[max(0, address_match.start() - 100):min(len(chunk), address_match.end() + 100)]
                price_match = re.search(self.property_patterns['price'], context)
                if price_match:
                    property_data['price'] = price_match.group(0).strip()
                    
                # Look for property details
                sqft_match = re.search(self.property_patterns['sqft'], context, re.IGNORECASE)
                if sqft_match:
                    property_data['square_feet'] = sqft_match.group(0).strip()
                    
                beds_match = re.search(self.property_patterns['beds'], context, re.IGNORECASE)
                if beds_match:
                    property_data['bedrooms'] = beds_match.group(0).strip()
                    
                baths_match = re.search(self.property_patterns['baths'], context, re.IGNORECASE)
                if baths_match:
                    property_data['bathrooms'] = baths_match.group(0).strip()
                
                # Add the surrounding context
                property_data['description'] = chunk.strip()
                
                # Only add if we have at least address and one other attribute
                if len(property_data) >= 2:
                    properties.append(property_data)
        
        return properties
    
    def extract_tax_delinquent_properties(self, content: str) -> List[Dict[str, Any]]:
        """
        Extract tax delinquent property information
        
        Args:
            content: The text content to parse
            
        Returns:
            List of dictionaries containing tax delinquent property details
        """
        properties = []
        
        # Look for patterns that indicate tax delinquent data
        owner_pattern = r'(?:Owner|Name):\s*([A-Za-z\s\.,]+)'
        amount_pattern = r'(?:Amount|Owed|Due|Taxes):\s*(\$\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
        date_pattern = r'(?:Due Date|Deadline):\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\w+ \d{1,2},? \d{4})'
        parcel_pattern = r'(?:Parcel|APN|Property ID):\s*([A-Z0-9\-]+)'
        
        # Extract chunks that might contain a full record
        chunks = re.split(r'\n\s*\n', content)
        
        for chunk in chunks:
            property_data = {}
            
            # Try to find an address first
            address_match = re.search(self.property_patterns['address'], chunk, re.IGNORECASE)
            if address_match:
                property_data['property_address'] = address_match.group(0).strip()
                
                # Look for other fields
                owner_match = re.search(owner_pattern, chunk, re.IGNORECASE)
                if owner_match:
                    property_data['owner_name'] = owner_match.group(1).strip()
                    
                amount_match = re.search(amount_pattern, chunk, re.IGNORECASE)
                if amount_match:
                    property_data['amount_owed'] = amount_match.group(1).strip()
                    
                date_match = re.search(date_pattern, chunk, re.IGNORECASE)
                if date_match:
                    property_data['due_date'] = date_match.group(1).strip()
                    
                parcel_match = re.search(parcel_pattern, chunk, re.IGNORECASE)
                if parcel_match:
                    property_data['parcel_id'] = parcel_match.group(1).strip()
                
                # Add surrounding context
                property_data['description'] = chunk.strip()
                
                # Add if we have at least address and one other attribute
                if len(property_data) >= 2:
                    properties.append(property_data)
        
        return properties
    
    def detect_content_type(self, url: str, content: str) -> str:
        """
        Detect the type of content based on URL and text
        
        Args:
            url: The source URL
            content: The text content
            
        Returns:
            String indicating content type ('tax_delinquent', 'probate', 'fsbo', or 'general')
        """
        url_lower = url.lower()
        content_lower = content.lower()
        
        # Check for tax delinquent indicators
        tax_terms = ['tax delinquent', 'delinquent taxes', 'tax sale', 'tax lien', 'property tax']
        if any(term in url_lower for term in tax_terms) or any(term in content_lower for term in tax_terms):
            return 'tax_delinquent'
            
        # Check for probate indicators
        probate_terms = ['probate', 'estate', 'deceased', 'inheritance', 'executor']
        if any(term in url_lower for term in probate_terms) or any(term in content_lower for term in probate_terms):
            return 'probate'
            
        # Check for FSBO indicators
        fsbo_terms = ['for sale by owner', 'fsbo', 'private seller', 'home for sale', 'house for sale']
        if any(term in url_lower for term in fsbo_terms) or any(term in content_lower for term in fsbo_terms):
            return 'fsbo'
            
        # Default to general
        return 'general'
    
    def _extract_domain(self, url: str) -> str:
        """Extract the domain from a URL"""
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        return domain
    
    def _extract_structured_data(self, content: str, url: str, domain: str) -> Dict[str, Any]:
        """Extract structured data based on content type"""
        content_type = self.detect_content_type(url, content)
        
        structured_data = {
            "content_type": content_type,
            "properties": []
        }
        
        if content_type == 'tax_delinquent':
            structured_data['properties'] = self.extract_tax_delinquent_properties(content)
        elif content_type in ['fsbo', 'general']:
            structured_data['properties'] = self.extract_real_estate_properties(content)
        # Add other content type extractors as needed
        
        return structured_data


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
    return text


def get_structured_website_content(url: str) -> Dict[str, Any]:
    """
    Extract structured content from a website with advanced parsing
    
    Args:
        url: The URL of the website to scrape
        
    Returns:
        Dict containing extracted content and structured data
    """
    scraper = WebScraper()
    return scraper.extract_content(url)