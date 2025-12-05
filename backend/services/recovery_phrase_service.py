"""
BGLIS v1.0 - Recovery Phrase Service

Generates, hashes, and verifies 12-word recovery phrases.
Uses BIP39-style wordlist for high entropy and memorability.
"""

import secrets
import bcrypt
from typing import List, Tuple


# Simplified BIP39-style wordlist (200 words for demo - production should use full 2048-word list)
WORDLIST = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
    "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
    "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
    "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
    "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
    "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
    "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger",
    "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique",
    "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic",
    "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest",
    "arrive", "arrow", "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset",
    "assist", "assume", "asthma", "athlete", "atom", "attack", "attend", "attitude", "attract", "auction",
    "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake",
    "aware", "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon", "badge",
    "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain",
    "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty", "because", "become",
    "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit",
    "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology",
    "bird", "birth", "bitter", "black", "blade", "blame", "blanket", "blast", "bleak", "bless",
    "blind", "blood", "blossom", "blouse", "blue", "blur", "blush", "board", "boat", "body"
]


class RecoveryPhraseService:
    """
    Service for recovery phrase operations
    """
    
    PHRASE_LENGTH = 12
    
    @staticmethod
    def generate_phrase() -> List[str]:
        """
        Generate a random 12-word recovery phrase
        
        Returns:
            List of 12 words
        """
        return [secrets.choice(WORDLIST) for _ in range(RecoveryPhraseService.PHRASE_LENGTH)]
    
    @staticmethod
    def normalize_phrase(phrase: str | List[str]) -> str:
        """
        Normalize recovery phrase to consistent format
        
        Args:
            phrase: Either space-separated string or list of words
        
        Returns:
            Lowercase, space-separated, trimmed string
        """
        if isinstance(phrase, list):
            phrase = " ".join(phrase)
        
        # Normalize: lowercase, strip extra spaces, single space between words
        words = phrase.lower().strip().split()
        return " ".join(words)
    
    @staticmethod
    def hash_phrase(phrase: str | List[str]) -> Tuple[str, str]:
        """
        Hash recovery phrase with bcrypt
        
        Args:
            phrase: Recovery phrase (string or list)
        
        Returns:
            Tuple of (hash, salt) as strings
            Note: bcrypt includes salt in hash, but we return separately for clarity
        """
        normalized = RecoveryPhraseService.normalize_phrase(phrase)
        
        # Generate salt and hash
        salt = bcrypt.gensalt()
        phrase_bytes = normalized.encode('utf-8')
        hash_bytes = bcrypt.hashpw(phrase_bytes, salt)
        
        # Return as strings
        return hash_bytes.decode('utf-8'), salt.decode('utf-8')
    
    @staticmethod
    def verify_phrase(
        phrase: str | List[str],
        stored_hash: str,
        stored_salt: str
    ) -> bool:
        """
        Verify recovery phrase against stored hash
        
        Args:
            phrase: User-provided phrase
            stored_hash: Stored hash from database
            stored_salt: Stored salt from database (for bcrypt, this is embedded in hash)
        
        Returns:
            True if phrase matches, False otherwise
        """
        normalized = RecoveryPhraseService.normalize_phrase(phrase)
        phrase_bytes = normalized.encode('utf-8')
        hash_bytes = stored_hash.encode('utf-8')
        
        try:
            return bcrypt.checkpw(phrase_bytes, hash_bytes)
        except Exception:
            return False
    
    @staticmethod
    def validate_phrase_format(phrase: str | List[str]) -> bool:
        """
        Validate that phrase has correct format (12 words)
        
        Args:
            phrase: Recovery phrase to validate
        
        Returns:
            True if valid format, False otherwise
        """
        normalized = RecoveryPhraseService.normalize_phrase(phrase)
        words = normalized.split()
        
        return len(words) == RecoveryPhraseService.PHRASE_LENGTH
