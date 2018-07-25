from __future__ import print_function
import studentFile
import unittest
import sys
import io
import random
from unittest.mock import patch

class UnitTests(unittest.TestCase):
    #random
    @patch("random.randint")
    def test_cards(self, mockRandInt):
        mockRandInt.return_value = 1
        result = studentFile.cards()
        self.assertEqual(result, "2 Clubs")

    #arguments passing in
    def test_birthday_song(self):
        song = 'happy birthday to you, happy birthday to you, happy birthday dear TEALS, happy birthday to you'
        self.assertAlmostEqual(studentFile.birthday_song('TEALS'), song)

    #printing
    @patch('sys.stdout.write')
    def test_hello_world(self, mock_print):
        studentFile.hello_world()
        mock_print.assert_any_call('Hello World')

if __name__ == '__main__':
    unittest.main()
