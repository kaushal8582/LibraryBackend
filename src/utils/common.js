function cleanKey(str = "") {
  return String(str)
    .normalize("NFKC")                // normalize unicode
    .replace(/[\r\n\t]/g, "")         // remove newline/tab
    .replace(/\s+/g, "")              // remove ALL spaces
    .replace(/[\u200B-\u200D\uFEFF]/g, ""); // invisible chars
}



export { cleanKey }