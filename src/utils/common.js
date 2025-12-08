function cleanKey(str) {
  return str
    .trim()                    // removes normal whitespace
    .replace(/\s+/g, "")       // removes newline, tabs
    .replace(/[\u200B-\u200D\uFEFF]/g, ""); // removes invisible unicode spaces
}


export { cleanKey }