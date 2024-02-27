function convertChineseSymbolsToEnglish(str: string) {
    const chineseSymbolMap: any = {
        '！': '!',
        '？': '?',
        '；': ';',
        '《': '<',
        '》': '>',
        '，': ',',
        '：': ':',
        '、': ',',
        // '(': ' ',
        // ')': ' ',
        // ...其他需要转换的中文符号及其对应的英文字符
    };
    
    for (let symbol in chineseSymbolMap) {
        str = str.replace(new RegExp('[' + symbol + ']', 'g'), chineseSymbolMap[symbol]);
    }
    
    return str;
}

function convertToHalfWidth(str: string) {
    // var fullwidthRegex = /[０-９]/g; // 全角数字范围为U+FF10 - U+FF19
    return str.replace(/[\u3000-\uffff]|[０-９]/g, function (match) {
        if (/^[０-９]$/.test(match)) {
            return String.fromCharCode(parseInt("2E80", 16) + match.charCodeAt(0));
        } else {
            return match;
        }
    });
}

export {convertChineseSymbolsToEnglish, convertToHalfWidth}