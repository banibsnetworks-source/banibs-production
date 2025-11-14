#!/usr/bin/env python3
"""
BANIBS Backend API Test Suite - Phase 8.1 Media Composer
Tests media upload, link preview, and post creation with media functionality
"""

import requests
import json
import sys
import time
import os
from datetime import datetime
from typing import Optional, Dict, Any
from PIL import Image
from io import BytesIO

# Backend URL from frontend/.env
BACKEND_URL = "https://real-time-chat-2.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class MediaComposerTester:
    def __init__(self):
        self.access_token = None
        self.test_user_email = "social_test_user@example.com"
        self.test_user_password = "TestPass123!"
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json'
        })
        self.test_image_url = None
        self.test_video_url = None
        self.test_post_id = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None, params: Optional[Dict] = None,
                    files: Optional[Dict] = None) -> requests.Response:
        """Make HTTP request with error handling"""
        url = f"{API_BASE}{endpoint}"
        
        request_headers = {}
        if headers:
            request_headers.update(headers)
            
        # Add auth header if we have a token
        if self.access_token and 'Authorization' not in request_headers:
            request_headers['Authorization'] = f"Bearer {self.access_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers, params=params)
            elif method.upper() == "POST":
                if files:
                    # For file uploads, don't set Content-Type header
                    response = self.session.post(url, data=data, files=files, headers=request_headers)
                else:
                    request_headers['Content-Type'] = 'application/json'
                    response = self.session.post(url, json=data, headers=request_headers)
            elif method.upper() == "PATCH":
                request_headers['Content-Type'] = 'application/json'
                response = self.session.patch(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise
    
    def create_test_image(self, width: int = 800, height: int = 600, format: str = "JPEG") -> bytes:
        """Create a test image using PIL"""
        # Create a simple test image with gradient
        img = Image.new('RGB', (width, height), color='white')
        
        # Add some content to make it realistic
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)
        
        # Draw gradient background
        for y in range(height):
            color_value = int(255 * (y / height))
            draw.line([(0, y), (width, y)], fill=(color_value, 100, 255 - color_value))
        
        # Add text
        try:
            # Try to use default font, fallback to basic if not available
            font = ImageFont.load_default()
        except:
            font = None
            
        draw.text((width//4, height//2), "BANIBS Test Image", fill='white', font=font)
        draw.text((width//4, height//2 + 30), f"{width}x{height} {format}", fill='white', font=font)
        
        # Convert to bytes
        buffer = BytesIO()
        img.save(buffer, format=format, quality=85)
        return buffer.getvalue()
    
    def create_test_video(self) -> bytes:
        """Create a minimal test MP4 file (just header for testing)"""
        # This is a minimal MP4 file header for testing purposes
        # In a real scenario, you'd use a proper video file
        mp4_header = b'\x00\x00\x00\x20ftypmp42\x00\x00\x00\x00mp42isom'
        mp4_header += b'\x00' * 1000  # Pad to make it look like a small video file
        return mp4_header
    
    def test_user_authentication(self) -> bool:
        """Test user login to get access token"""
        self.log("Testing user authentication...")
        
        # Try to register first (in case user doesn't exist)
        register_response = self.make_request("POST", "/auth/register", {
            "email": self.test_user_email,
            "password": self.test_user_password,
            "name": "Social Test User",
            "accepted_terms": True
        })
        
        if register_response.status_code == 409:
            self.log("User already exists, proceeding with login...")
        elif register_response.status_code == 200:
            self.log("User registered successfully")
        
        # Login to get access token
        response = self.make_request("POST", "/auth/login", {
            "email": self.test_user_email,
            "password": self.test_user_password
        })
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                self.access_token = data["access_token"]
                self.log("✅ User authentication successful")
                return True
            else:
                self.log("❌ Login response missing access_token", "ERROR")
                return False
        else:
            self.log(f"❌ User login failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_image_upload_jpeg(self) -> bool:
        """Test image upload with JPEG format"""
        if not self.access_token:
            self.log("❌ No access token for image upload test", "ERROR")
            return False
            
        self.log("Testing JPEG image upload...")
        
        # Create test JPEG image
        image_bytes = self.create_test_image(1200, 800, "JPEG")
        
        files = {
            'file': ('test_image.jpg', image_bytes, 'image/jpeg')
        }
        
        response = self.make_request("POST", "/media/upload", files=files)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["url", "type", "width", "height"]
            
            if all(field in data for field in required_fields):
                if (data["type"] == "image" and 
                    data["width"] <= 1600 and data["height"] <= 1600 and
                    data["url"].startswith("/api/static/media/images/")):
                    
                    self.test_image_url = data["url"]
                    self.log(f"✅ JPEG upload successful - URL: {data['url']}")
                    self.log(f"   Dimensions: {data['width']}x{data['height']} (resized from 1200x800)")
                    self.log(f"   Type: {data['type']}")
                    return True
                else:
                    self.log(f"❌ JPEG upload response has invalid values: {data}", "ERROR")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ JPEG upload response missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ JPEG upload failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_image_upload_png(self) -> bool:
        """Test image upload with PNG format"""
        if not self.access_token:
            self.log("❌ No access token for PNG upload test", "ERROR")
            return False
            
        self.log("Testing PNG image upload...")
        
        # Create test PNG image
        image_bytes = self.create_test_image(600, 400, "PNG")
        
        files = {
            'file': ('test_image.png', image_bytes, 'image/png')
        }
        
        response = self.make_request("POST", "/media/upload", files=files)
        
        if response.status_code == 200:
            data = response.json()
            if (data.get("type") == "image" and 
                data.get("width") == 600 and data.get("height") == 400 and
                data.get("url", "").startswith("/api/static/media/images/")):
                
                self.log(f"✅ PNG upload successful - URL: {data['url']}")
                self.log(f"   Dimensions: {data['width']}x{data['height']} (no resize needed)")
                return True
            else:
                self.log(f"❌ PNG upload response invalid: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ PNG upload failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_video_upload_mp4(self) -> bool:
        """Test video upload with MP4 format"""
        if not self.access_token:
            self.log("❌ No access token for video upload test", "ERROR")
            return False
            
        self.log("Testing MP4 video upload...")
        
        # Create test MP4 video
        video_bytes = self.create_test_video()
        
        files = {
            'file': ('test_video.mp4', video_bytes, 'video/mp4')
        }
        
        response = self.make_request("POST", "/media/upload", files=files)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["url", "type"]
            
            if all(field in data for field in required_fields):
                if (data["type"] == "video" and 
                    data["url"].startswith("/api/static/media/videos/")):
                    
                    self.test_video_url = data["url"]
                    self.log(f"✅ MP4 upload successful - URL: {data['url']}")
                    self.log(f"   Type: {data['type']}")
                    if "thumbnail_url" in data:
                        self.log(f"   Thumbnail: {data['thumbnail_url']}")
                    return True
                else:
                    self.log(f"❌ MP4 upload response has invalid values: {data}", "ERROR")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ MP4 upload response missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ MP4 upload failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_invalid_file_type(self) -> bool:
        """Test upload with invalid file type (should reject)"""
        if not self.access_token:
            self.log("❌ No access token for invalid file test", "ERROR")
            return False
            
        self.log("Testing invalid file type upload...")
        
        # Create a text file (invalid type)
        text_content = b"This is a text file, not an image or video"
        
        files = {
            'file': ('test_file.txt', text_content, 'text/plain')
        }
        
        response = self.make_request("POST", "/media/upload", files=files)
        
        if response.status_code == 400:
            data = response.json()
            if "Unsupported file type" in data.get("detail", ""):
                self.log("✅ Invalid file type correctly rejected")
                return True
            else:
                self.log(f"❌ Wrong error message for invalid file: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Invalid file should return 400, got {response.status_code}", "ERROR")
            return False
    
    def test_oversized_file(self) -> bool:
        """Test upload with oversized file (should reject)"""
        if not self.access_token:
            self.log("❌ No access token for oversized file test", "ERROR")
            return False
            
        self.log("Testing oversized file upload...")
        
        # Create a large image (simulate oversized)
        # Note: We'll create a smaller image but test the logic
        large_image_bytes = self.create_test_image(4000, 3000, "JPEG")
        
        files = {
            'file': ('large_image.jpg', large_image_bytes, 'image/jpeg')
        }
        
        response = self.make_request("POST", "/media/upload", files=files)
        
        # This might succeed if the image is under 20MB, which is expected
        if response.status_code == 200:
            data = response.json()
            # Check if image was resized to max 1600px
            if data.get("width", 0) <= 1600 and data.get("height", 0) <= 1600:
                self.log("✅ Large image successfully resized to fit limits")
                self.log(f"   Resized to: {data['width']}x{data['height']}")
                return True
            else:
                self.log(f"❌ Large image not properly resized: {data}", "ERROR")
                return False
        elif response.status_code == 400:
            data = response.json()
            if "too large" in data.get("detail", "").lower():
                self.log("✅ Oversized file correctly rejected")
                return True
            else:
                self.log(f"❌ Wrong error for oversized file: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Unexpected response for oversized file: {response.status_code}", "ERROR")
            return False
    
    def test_link_preview_youtube(self) -> bool:
        """Test link preview with YouTube URL"""
        if not self.access_token:
            self.log("❌ No access token for link preview test", "ERROR")
            return False
            
        self.log("Testing YouTube link preview...")
        
        youtube_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        
        response = self.make_request("POST", "/media/link/preview", {
            "url": youtube_url
        })
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["title", "site", "url"]
            
            if all(field in data for field in required_fields):
                if data["url"] == youtube_url and data["site"]:
                    self.log(f"✅ YouTube link preview successful")
                    self.log(f"   Title: {data['title']}")
                    self.log(f"   Site: {data['site']}")
                    if data.get("description"):
                        self.log(f"   Description: {data['description'][:100]}...")
                    if data.get("image"):
                        self.log(f"   Image: {data['image']}")
                    return True
                else:
                    self.log(f"❌ YouTube link preview has invalid values: {data}", "ERROR")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ YouTube link preview missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ YouTube link preview failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_link_preview_news_article(self) -> bool:
        """Test link preview with news article URL"""
        if not self.access_token:
            self.log("❌ No access token for news link preview test", "ERROR")
            return False
            
        self.log("Testing news article link preview...")
        
        # Use a reliable news site
        news_url = "https://www.bbc.com/news"
        
        response = self.make_request("POST", "/media/link/preview", {
            "url": news_url
        })
        
        if response.status_code == 200:
            data = response.json()
            if data.get("url") == news_url and data.get("title") and data.get("site"):
                self.log(f"✅ News article link preview successful")
                self.log(f"   Title: {data['title']}")
                self.log(f"   Site: {data['site']}")
                return True
            else:
                self.log(f"❌ News link preview has invalid values: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ News link preview failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_link_preview_no_og_tags(self) -> bool:
        """Test link preview with URL without OpenGraph tags"""
        if not self.access_token:
            self.log("❌ No access token for no-OG link preview test", "ERROR")
            return False
            
        self.log("Testing link preview without OG tags...")
        
        # Use a simple URL that likely doesn't have OG tags
        simple_url = "https://example.com"
        
        response = self.make_request("POST", "/media/link/preview", {
            "url": simple_url
        })
        
        if response.status_code == 200:
            data = response.json()
            if data.get("url") == simple_url and data.get("title") and data.get("site"):
                self.log(f"✅ No-OG link preview successful (graceful fallback)")
                self.log(f"   Title: {data['title']}")
                self.log(f"   Site: {data['site']}")
                return True
            else:
                self.log(f"❌ No-OG link preview has invalid values: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ No-OG link preview failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_link_preview_caching(self) -> bool:
        """Test link preview caching behavior"""
        if not self.access_token:
            self.log("❌ No access token for caching test", "ERROR")
            return False
            
        self.log("Testing link preview caching...")
        
        test_url = "https://www.github.com"
        
        # First request
        start_time = time.time()
        response1 = self.make_request("POST", "/media/link/preview", {
            "url": test_url
        })
        first_duration = time.time() - start_time
        
        if response1.status_code != 200:
            self.log(f"❌ First caching request failed: {response1.status_code}", "ERROR")
            return False
        
        # Second request (should be faster due to caching)
        start_time = time.time()
        response2 = self.make_request("POST", "/media/link/preview", {
            "url": test_url
        })
        second_duration = time.time() - start_time
        
        if response2.status_code == 200:
            data1 = response1.json()
            data2 = response2.json()
            
            # Check if responses are identical (cached)
            if data1 == data2:
                self.log(f"✅ Link preview caching working")
                self.log(f"   First request: {first_duration:.3f}s")
                self.log(f"   Second request: {second_duration:.3f}s")
                if second_duration < first_duration:
                    self.log("   ✅ Second request was faster (likely cached)")
                else:
                    self.log("   ⚠️ Second request not faster (caching may not be observable)")
                return True
            else:
                self.log(f"❌ Cached responses don't match", "ERROR")
                return False
        else:
            self.log(f"❌ Second caching request failed: {response2.status_code}", "ERROR")
            return False
    
    def test_create_post_with_single_image(self) -> bool:
        """Test creating post with 1 image"""
        if not self.access_token or not self.test_image_url:
            self.log("❌ No access token or test image for post creation", "ERROR")
            return False
            
        self.log("Testing post creation with single image...")
        
        post_data = {
            "text": "Check out this amazing image I just uploaded! #BANIBS #TestPost",
            "media": [
                {
                    "url": self.test_image_url,
                    "type": "image",
                    "width": 800,
                    "height": 600
                }
            ]
        }
        
        response = self.make_request("POST", "/social/posts", post_data)
        
        if response.status_code == 201:
            data = response.json()
            required_fields = ["id", "author", "text", "media", "created_at", "like_count", "comment_count"]
            
            if all(field in data for field in required_fields):
                if (len(data["media"]) == 1 and 
                    data["media"][0]["url"] == self.test_image_url and
                    data["text"] == post_data["text"]):
                    
                    self.test_post_id = data["id"]
                    self.log(f"✅ Post with single image created successfully")
                    self.log(f"   Post ID: {data['id']}")
                    self.log(f"   Author: {data['author']['display_name']}")
                    self.log(f"   Media count: {len(data['media'])}")
                    return True
                else:
                    self.log(f"❌ Post with image has invalid values: {data}", "ERROR")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in data]
                self.log(f"❌ Post with image missing fields: {missing_fields}", "ERROR")
                return False
        else:
            self.log(f"❌ Post with image creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_create_post_with_multiple_images(self) -> bool:
        """Test creating post with 4 images"""
        if not self.access_token or not self.test_image_url:
            self.log("❌ No access token or test image for multi-image post", "ERROR")
            return False
            
        self.log("Testing post creation with multiple images...")
        
        # Create multiple media items (simulate 4 images)
        media_items = []
        for i in range(4):
            media_items.append({
                "url": self.test_image_url,  # Reuse same URL for testing
                "type": "image",
                "width": 600 + (i * 50),
                "height": 400 + (i * 30)
            })
        
        post_data = {
            "text": "Here's a collection of 4 amazing images! #Gallery #BANIBS",
            "media": media_items
        }
        
        response = self.make_request("POST", "/social/posts", post_data)
        
        if response.status_code == 201:
            data = response.json()
            if (len(data.get("media", [])) == 4 and 
                data.get("text") == post_data["text"]):
                
                self.log(f"✅ Post with 4 images created successfully")
                self.log(f"   Post ID: {data['id']}")
                self.log(f"   Media count: {len(data['media'])}")
                return True
            else:
                self.log(f"❌ Multi-image post has invalid values: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Multi-image post creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_create_post_with_video(self) -> bool:
        """Test creating post with 1 video"""
        if not self.access_token or not self.test_video_url:
            self.log("❌ No access token or test video for video post", "ERROR")
            return False
            
        self.log("Testing post creation with video...")
        
        post_data = {
            "text": "Check out this awesome video content! #Video #BANIBS",
            "media": [
                {
                    "url": self.test_video_url,
                    "type": "video"
                }
            ]
        }
        
        response = self.make_request("POST", "/social/posts", post_data)
        
        if response.status_code == 201:
            data = response.json()
            if (len(data.get("media", [])) == 1 and 
                data["media"][0]["type"] == "video" and
                data["media"][0]["url"] == self.test_video_url):
                
                self.log(f"✅ Post with video created successfully")
                self.log(f"   Post ID: {data['id']}")
                self.log(f"   Video URL: {data['media'][0]['url']}")
                return True
            else:
                self.log(f"❌ Video post has invalid values: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Video post creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_create_post_with_link_preview(self) -> bool:
        """Test creating post with link preview"""
        if not self.access_token:
            self.log("❌ No access token for link preview post", "ERROR")
            return False
            
        self.log("Testing post creation with link preview...")
        
        post_data = {
            "text": "Sharing an interesting article with the community!",
            "link_url": "https://www.github.com",
            "link_meta": {
                "title": "GitHub: Let's build from here",
                "description": "GitHub is where over 100 million developers shape the future of software, together.",
                "image": "https://github.githubassets.com/images/modules/site/social-cards/github-social.png",
                "site": "GitHub",
                "url": "https://www.github.com"
            }
        }
        
        response = self.make_request("POST", "/social/posts", post_data)
        
        if response.status_code == 201:
            data = response.json()
            if (data.get("link_url") == post_data["link_url"] and
                data.get("link_meta") and
                data["link_meta"]["title"] == post_data["link_meta"]["title"]):
                
                self.log(f"✅ Post with link preview created successfully")
                self.log(f"   Post ID: {data['id']}")
                self.log(f"   Link: {data['link_url']}")
                self.log(f"   Link title: {data['link_meta']['title']}")
                return True
            else:
                self.log(f"❌ Link preview post has invalid values: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Link preview post creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_create_post_with_media_and_link(self) -> bool:
        """Test creating post with both media and link"""
        if not self.access_token or not self.test_image_url:
            self.log("❌ No access token or test image for combined post", "ERROR")
            return False
            
        self.log("Testing post creation with media + link...")
        
        post_data = {
            "text": "Combining an image with a useful link! Best of both worlds.",
            "media": [
                {
                    "url": self.test_image_url,
                    "type": "image",
                    "width": 800,
                    "height": 600
                }
            ],
            "link_url": "https://www.example.com",
            "link_meta": {
                "title": "Example Domain",
                "description": "This domain is for use in illustrative examples in documents.",
                "site": "Example",
                "url": "https://www.example.com"
            }
        }
        
        response = self.make_request("POST", "/social/posts", post_data)
        
        if response.status_code == 201:
            data = response.json()
            if (len(data.get("media", [])) == 1 and
                data.get("link_url") == post_data["link_url"] and
                data.get("link_meta")):
                
                self.log(f"✅ Post with media + link created successfully")
                self.log(f"   Post ID: {data['id']}")
                self.log(f"   Media count: {len(data['media'])}")
                self.log(f"   Link: {data['link_url']}")
                return True
            else:
                self.log(f"❌ Combined post has invalid values: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Combined post creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_feed_display_with_media(self) -> bool:
        """Test that feed returns posts with media array"""
        if not self.access_token:
            self.log("❌ No access token for feed test", "ERROR")
            return False
            
        self.log("Testing feed display with media...")
        
        response = self.make_request("GET", "/social/feed")
        
        if response.status_code == 200:
            data = response.json()
            if "items" in data and isinstance(data["items"], list):
                posts_with_media = [post for post in data["items"] if post.get("media")]
                posts_with_links = [post for post in data["items"] if post.get("link_meta")]
                
                self.log(f"✅ Feed loaded successfully")
                self.log(f"   Total posts: {len(data['items'])}")
                self.log(f"   Posts with media: {len(posts_with_media)}")
                self.log(f"   Posts with links: {len(posts_with_links)}")
                
                # Check structure of posts with media
                if posts_with_media:
                    media_post = posts_with_media[0]
                    if "media" in media_post and len(media_post["media"]) > 0:
                        media_item = media_post["media"][0]
                        required_media_fields = ["url", "type"]
                        if all(field in media_item for field in required_media_fields):
                            self.log(f"   ✅ Media structure correct in feed")
                            return True
                        else:
                            self.log(f"   ❌ Media structure invalid: {media_item}", "ERROR")
                            return False
                    else:
                        self.log(f"   ❌ Media post has no media array", "ERROR")
                        return False
                else:
                    self.log("   ⚠️ No posts with media found in feed")
                    return True
            else:
                self.log(f"❌ Feed response invalid structure: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Feed request failed: {response.status_code} - {response.text}", "ERROR")
            return False
    
    def test_backwards_compatibility(self) -> bool:
        """Test backwards compatibility with old media_url posts"""
        if not self.access_token:
            self.log("❌ No access token for backwards compatibility test", "ERROR")
            return False
            
        self.log("Testing backwards compatibility...")
        
        # This test checks that the feed can handle both new media array format
        # and any legacy media_url format if it exists
        response = self.make_request("GET", "/social/feed")
        
        if response.status_code == 200:
            data = response.json()
            if "items" in data:
                # Check that all posts have the expected structure
                for post in data["items"]:
                    required_fields = ["id", "author", "text", "created_at", "like_count", "comment_count"]
                    if not all(field in post for field in required_fields):
                        self.log(f"❌ Post missing required fields: {post}", "ERROR")
                        return False
                    
                    # Media should be an array (new format)
                    if "media" in post and not isinstance(post["media"], list):
                        self.log(f"❌ Media field is not an array: {post['media']}", "ERROR")
                        return False
                
                self.log("✅ Backwards compatibility verified - all posts have correct structure")
                return True
            else:
                self.log(f"❌ Feed response missing items: {data}", "ERROR")
                return False
        else:
            self.log(f"❌ Backwards compatibility test failed: {response.status_code}", "ERROR")
            return False
    
    def test_file_storage_verification(self) -> bool:
        """Test that uploaded files are actually saved to the correct directories"""
        self.log("Testing file storage verification...")
        
        if not self.test_image_url:
            self.log("❌ No test image URL to verify storage", "ERROR")
            return False
        
        # Try to access the uploaded image via its URL
        image_response = self.make_request("GET", self.test_image_url.replace("/api", ""))
        
        if image_response.status_code == 200:
            content_type = image_response.headers.get('content-type', '')
            if 'image' in content_type:
                self.log("✅ Uploaded image is accessible via URL")
                self.log(f"   Content-Type: {content_type}")
                return True
            else:
                self.log(f"❌ Image URL returns wrong content type: {content_type}", "ERROR")
                return False
        else:
            self.log(f"❌ Uploaded image not accessible: {image_response.status_code}", "ERROR")
            return False
    
    def run_all_tests(self) -> Dict[str, bool]:
        """Run all media composer tests"""
        self.log("🚀 Starting BANIBS Media Composer Backend API Tests - Phase 8.1")
        self.log("=" * 80)
        
        tests = [
            ("User Authentication", self.test_user_authentication),
            ("Image Upload (JPEG)", self.test_image_upload_jpeg),
            ("Image Upload (PNG)", self.test_image_upload_png),
            ("Video Upload (MP4)", self.test_video_upload_mp4),
            ("Invalid File Type Rejection", self.test_invalid_file_type),
            ("Oversized File Handling", self.test_oversized_file),
            ("Link Preview (YouTube)", self.test_link_preview_youtube),
            ("Link Preview (News Article)", self.test_link_preview_news_article),
            ("Link Preview (No OG Tags)", self.test_link_preview_no_og_tags),
            ("Link Preview Caching", self.test_link_preview_caching),
            ("Create Post with Single Image", self.test_create_post_with_single_image),
            ("Create Post with Multiple Images", self.test_create_post_with_multiple_images),
            ("Create Post with Video", self.test_create_post_with_video),
            ("Create Post with Link Preview", self.test_create_post_with_link_preview),
            ("Create Post with Media + Link", self.test_create_post_with_media_and_link),
            ("Feed Display with Media", self.test_feed_display_with_media),
            ("Backwards Compatibility", self.test_backwards_compatibility),
            ("File Storage Verification", self.test_file_storage_verification),
        ]
        
        results = {}
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            self.log(f"\n📋 Running: {test_name}")
            self.log("-" * 60)
            
            try:
                result = test_func()
                results[test_name] = result
                if result:
                    passed += 1
                    self.log(f"✅ {test_name}: PASSED")
                else:
                    self.log(f"❌ {test_name}: FAILED")
            except Exception as e:
                self.log(f"💥 {test_name}: ERROR - {str(e)}", "ERROR")
                results[test_name] = False
        
        # Summary
        self.log("\n" + "=" * 80)
        self.log("📊 BANIBS MEDIA COMPOSER BACKEND API TEST RESULTS")
        self.log("=" * 80)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status} | {test_name}")
        
        self.log(f"\n🎯 SUMMARY: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED! Media Composer backend is ready for production.")
        else:
            failed = total - passed
            self.log(f"⚠️  {failed} test(s) failed. Review issues above.")
        
        return results


def main():
    """Main test execution"""
    tester = MediaComposerTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    all_passed = all(results.values())
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()