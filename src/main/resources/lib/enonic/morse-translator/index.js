/**
 * Translate text into morse code
 * @param text
 * @returns {string}
 */
exports.translate = function(text) {
    var translatedText = '';
    var characterSeparator = ' ';
    var characterMap = getMorseCharacterMap();

    // Iterate through each character in text
    for (var i = 0, j = text.length; i < j; i++) {
        var character = text.toLowerCase()[i];
        var translatedCharacter = '?';

        if (character in characterMap) {
            translatedCharacter = characterMap[character];
        }

        translatedText += translatedCharacter;

        // If not last character in text
        if (i < j) {
            translatedText += characterSeparator;
        }
    }

    return translatedText;
};

/**
 * Get a mapping for morse characters
 * @returns {Object}
 */
function getMorseCharacterMap() {
    var wordSeparator = '/';

    return {
        'a': '.-',
        'b': '-...',
        'c': '-.-.',
        'd': '-..',
        'e': '.',
        'f': '..-.',
        'g': '--.',
        'h': '....',
        'i': '..',
        'j': '.---',
        'k': '-.-',
        'l': '.-..',
        'm': '--',
        'n': '-.',
        'o': '---',
        'p': '.--.',
        'q': '--.-',
        'r': '.-.',
        's': '...',
        't': '-',
        'u': '..-',
        'v': '...-',
        'w': '.--',
        'x': '-..-',
        'y': '-.--',
        'z': '--..',
        '1': '.----',
        '2': '..---',
        '3': '...--',
        '4': '....-',
        '5': '.....',
        '6': '-....',
        '7': '--...',
        '8': '---..',
        '9': '----.',
        '0': '-----',
        ' ': wordSeparator
    };
}