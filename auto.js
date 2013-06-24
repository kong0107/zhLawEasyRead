if(typeof LER == "object") {
    if(LER.autoParse instanceof Element) {
        LER.parse(LER.autoParse);
        LER.debugTime("parse all");
    }
}