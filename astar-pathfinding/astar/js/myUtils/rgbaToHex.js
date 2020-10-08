
// Takes an rgba() CSS value and converts it to its 8 digit hexadecimal value.
//
// Usage: ./rgbaToHex.js "{YOUR_RGBA_STRING}"
//
// Example: ./rgbaToHex.js "rgba(197, 200, 198, .2)" => #C5C8C633

function trim (str) {
    return str.replace(/^\s+|\s+$/gm,'');
}

function rgbaToHex(rgba) {
    var parts = rgba.substring(rgba.indexOf("(")).split(","),
        r = parseInt(trim(parts[0].substring(1)), 10),
        g = parseInt(trim(parts[1]), 10),
        b = parseInt(trim(parts[2]), 10),
        a = parseFloat(trim(parts[3].substring(0, parts[3].length - 1))).toFixed(2);

    return ('#' + r.toString(16) + g.toString(16) + b.toString(16) + (a * 255).toString(16).substring(0,2));
}

