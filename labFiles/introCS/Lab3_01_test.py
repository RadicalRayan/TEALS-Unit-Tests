from __future__ import print_function
import Lab01
import unittest
import contextlib
import sys
import io
import random
from unittest.mock import patch


class UnitTests(unittest.TestCase):
    def testOutput(output):
        assert(output in ["Outlook is good", "Ask again later", "Yes", "No", "Most likely no", "Most likely yes", "Maybe", "Outlook is not good"])

    # Testing that function never outputs anything outside of acceptable values
    def test_correct_outputs(self):
        saved_stdout = sys.stdout
        try:
            for i in range(100):
                sys.stdout = io.StringIO()
                Lab3_01.magic8ball()
                output = sys.stdout.getvalue().strip()
                testOutput(output)
        finally:
            sys.stdout = saved_stdout

    # Test that randint is called correctly
    @patch("random.randint")
    def test_cards(self, mockRandInt):
        mockRandInt.return_value = 0
        result = Lab3_01.magic8ball()
        self.assertEqual(result, "Outlook is good")

if __name__ == '__main__':
    unittest.main() 