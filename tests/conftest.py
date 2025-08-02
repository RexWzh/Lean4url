"""
Pytest configuration and fixtures for lean4url tests.

Author: Rex Wang
"""

import pytest
import subprocess
import time
import requests
import os
import signal
from typing import Generator


@pytest.fixture(scope="session")
def js_service() -> Generator[str, None, None]:
    """
    Start JavaScript test service for compatibility testing.
    
    Yields:
        Base URL of the JavaScript service
    """
    # Check if service is already running
    try:
        response = requests.get("http://localhost:3000/health", timeout=2)
        if response.status_code == 200:
            yield "http://localhost:3000"
            return
    except requests.RequestException:
        pass
    
    # Start the JavaScript service
    js_service_dir = os.path.join(os.path.dirname(__file__), "js_service")
    
    # Install dependencies if needed
    if not os.path.exists(os.path.join(js_service_dir, "node_modules")):
        subprocess.run(["npm", "install"], cwd=js_service_dir, check=True)
    
    # Start the service
    process = subprocess.Popen(
        ["node", "server.js"],
        cwd=js_service_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for service to start
    for _ in range(30):  # Wait up to 30 seconds
        try:
            response = requests.get("http://localhost:3000/health", timeout=1)
            if response.status_code == 200:
                break
        except requests.RequestException:
            pass
        time.sleep(1)
    else:
        process.terminate()
        raise RuntimeError("JavaScript service failed to start")
    
    try:
        yield "http://localhost:3000"
    finally:
        # Clean up
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()


@pytest.fixture
def test_strings():
    """
    Provide various test strings for compression testing.
    
    Returns:
        List of test strings covering different scenarios
    """
    return [
        "",  # Empty string
        "a",  # Single character
        "Hello, World!",  # Basic ASCII
        "Hello, 世界! 🌍",  # Mixed Unicode
        "𝔓",  # The problematic character from the issue
        "🚀🎉💻",  # Multiple emojis
        "A" * 1000,  # Long repetitive string
        "The quick brown fox jumps over the lazy dog" * 10,  # Longer text
        "中文测试文本",  # Chinese text
        "🌟✨💫⭐🌠",  # More emojis
        "Mixed 中文 and English with 🎯 emojis",  # Complex mixed content
        "\n\t\r\\\"\'",  # Special characters
        "JSON: {\"key\": \"value\", \"array\": [1, 2, 3]}",  # JSON-like string
    ]


@pytest.fixture
def unicode_edge_cases():
    """
    Provide Unicode edge cases for testing.
    
    Returns:
        List of Unicode edge case strings
    """
    return [
        "\U0001F600",  # 😀 (U+1F600)
        "\U0001F680",  # 🚀 (U+1F680)
        "\U0001D4D3",  # 𝔓 (U+1D4D3) - The problematic character
        "\U0001F1E8\U0001F1F3",  # 🇨🇳 (Chinese flag, combining characters)
        "\U0001F468\u200D\U0001F4BB",  # 👨‍💻 (Man technologist with ZWJ)
        "\U0001F469\u200D\U0001F52C",  # 👩‍🔬 (Woman scientist with ZWJ)
        "\u0041\u0300",  # À (A with combining grave accent)
        "\u1F1E6\u1F1F7",  # 🇦🇷 (Argentina flag)
    ]
