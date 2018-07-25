# Test code for lab 4.01

from __future__ import print_function
import Lab4_01
import unittest
import sys
import io
import random
from unittest.mock import patch


class UnitTests(unittest.TestCase):

    # test cases for the de_vowel function
    def test_de_vowel(self):
        self.assertEqual(Lab4_01.de_vowel("This sentence has no vowels"), "Ths sntnc hs n vwls")
        self.assertEqual(Lab4_01.de_vowel(""), "")
        self.assertEqual(Lab4_01.de_vowel("a"), "")
        self.assertEqual(Lab4_01.de_vowel("b"), "b")
        self.assertEqual(Lab4_01.de_vowel("AEIOUaeiou"), "")
        self.assertEqual(Lab4_01.de_vowel("BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz"), "BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz")
        self.assertEqual(Lab4_01.de_vowel("Waltz, bad nymph, for quick jigs vex!"), "Wltz, bd nymph, fr qck jgs vx!")
        self.assertEqual(Lab4_01.de_vowel(".?!,"), ".?!,")

    #test cases for the count_vowels function
    def test_count_vowels(self):
        self.assertEqual(Lab4_01.count_vowels("This sentence has no vowels"), 8)
        self.assertEqual(Lab4_01.count_vowels(""), 0)
        self.assertEqual(Lab4_01.count_vowels("a"), 1)
        self.assertEqual(Lab4_01.count_vowels("b"), 0)
        self.assertEqual(Lab4_01.count_vowels("AEIOUaeiou"), 10)
        self.assertEqual(Lab4_01.count_vowels("BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz"), 0)
        self.assertEqual(Lab4_01.count_vowels("Waltz, bad nymph, for quick jigs vex!"), 7)
        self.assertEqual(Lab4_01.count_vowels(".?!,"), 0)

if __name__ == '__main__':
    unittest.main()
