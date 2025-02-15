const REGEXES = (() => {
    const tlds = ["NORTHWESTERNMUTUAL", "TRAVELERSINSURANCE", "AMERICANEXPRESS", "KERRYPROPERTIES", "SANDVIKCOROMANT", "AFAMILYCOMPANY", "AMERICANFAMILY", "BANANAREPUBLIC", "CANCERRESEARCH", "COOKINGCHANNEL", "KERRYLOGISTICS", "WEATHERCHANNEL", "INTERNATIONAL", "LIFEINSURANCE", "SPREADBETTING", "TRAVELCHANNEL", "WOLTERSKLUWER", "CONSTRUCTION", "LPLFINANCIAL", "SCHOLARSHIPS", "VERSICHERUNG", "ACCOUNTANTS", "BARCLAYCARD", "BLACKFRIDAY", "BLOCKBUSTER", "BRIDGESTONE", "CALVINKLEIN", "CONTRACTORS", "CREDITUNION", "ENGINEERING", "ENTERPRISES", "FOODNETWORK", "INVESTMENTS", "KERRYHOTELS", "LAMBORGHINI", "MOTORCYCLES", "OLAYANGROUP", "PHOTOGRAPHY", "PLAYSTATION", "PRODUCTIONS", "PROGRESSIVE", "REDUMBRELLA", "RIGHTATHOME", "WILLIAMHILL", "ACCOUNTANT", "APARTMENTS", "ASSOCIATES", "BASKETBALL", "BNPPARIBAS", "BOEHRINGER", "CAPITALONE", "CONSULTING", "CREDITCARD", "CUISINELLA", "EUROVISION", "EXTRASPACE", "FOUNDATION", "HEALTHCARE", "IMMOBILIEN", "INDUSTRIES", "MANAGEMENT", "MITSUBISHI", "NATIONWIDE", "NEWHOLLAND", "NEXTDIRECT", "ONYOURSIDE", "PROPERTIES", "PROTECTION", "PRUDENTIAL", "REALESTATE", "REPUBLICAN", "RESTAURANT", "SCHAEFFLER", "SWIFTCOVER", "TATAMOTORS", "TECHNOLOGY", "TELEFONICA", "UNIVERSITY", "VISTAPRINT", "VLAANDEREN", "VOLKSWAGEN", "ACCENTURE", "ALFAROMEO", "ALLFINANZ", "AMSTERDAM", "ANALYTICS", "AQUARELLE", "BARCELONA", "BLOOMBERG", "CHRISTMAS", "COMMUNITY", "DIRECTORY", "EDUCATION", "EQUIPMENT", "FAIRWINDS", "FINANCIAL", "FIRESTONE", "FRESENIUS", "FRONTDOOR", "FUJIXEROX", "FURNITURE", "GOLDPOINT", "HISAMITSU", "HOMEDEPOT", "HOMEGOODS", "HOMESENSE", "HONEYWELL", "INSTITUTE", "INSURANCE", "KUOKGROUP", "LADBROKES", "LANCASTER", "LANDROVER", "LIFESTYLE", "MARKETING", "MARSHALLS", "MELBOURNE", "MICROSOFT", "PANASONIC", "PASSAGENS", "PRAMERICA", "RICHARDLI", "SCJOHNSON", "SHANGRILA", "SOLUTIONS", "STATEBANK", "STATEFARM", "STOCKHOLM", "TRAVELERS", "VACATIONS", "YODOBASHI", "ABUDHABI", "AIRFORCE", "ALLSTATE", "ATTORNEY", "BARCLAYS", "BAREFOOT", "BARGAINS", "BASEBALL", "BOUTIQUE", "BRADESCO", "BROADWAY", "BRUSSELS", "BUDAPEST", "BUILDERS", "BUSINESS", "CAPETOWN", "CATERING", "CATHOLIC", "CHRYSLER", "CIPRIANI", "CITYEATS", "CLEANING", "CLINIQUE", "CLOTHING", "COMMBANK", "COMPUTER", "DELIVERY", "DELOITTE", "DEMOCRAT", "DIAMONDS", "DISCOUNT", "DISCOVER", "DOWNLOAD", "ENGINEER", "ERICSSON", "ESURANCE", "ETISALAT", "EVERBANK", "EXCHANGE", "FEEDBACK", "FIDELITY", "FIRMDALE", "FOOTBALL", "FRONTIER", "GOODYEAR", "GRAINGER", "GRAPHICS", "GUARDIAN", "HDFCBANK", "HELSINKI", "HOLDINGS", "HOSPITAL", "INFINITI", "IPIRANGA", "ISTANBUL", "JPMORGAN", "LIGHTING", "LUNDBECK", "MARRIOTT", "MASERATI", "MCKINSEY", "MEMORIAL", "MERCKMSD", "MORTGAGE", "MOVISTAR", "OBSERVER", "PARTNERS", "PHARMACY", "PICTURES", "PLUMBING", "PROPERTY", "REDSTONE", "RELIANCE", "SAARLAND", "SAMSCLUB", "SECURITY", "SERVICES", "SHOPPING", "SHOWTIME", "SOFTBANK", "SOFTWARE", "STCGROUP", "SUPPLIES", "SYMANTEC", "TRAINING", "UCONNECT", "VANGUARD", "VENTURES", "VERISIGN", "WOODSIDE", "YOKOHAMA", "ABOGADO", "ACADEMY", "AGAKHAN", "ALIBABA", "ANDROID", "ATHLETA", "AUCTION", "AUDIBLE", "AUSPOST", "AVIANCA", "BANAMEX", "BAUHAUS", "BENTLEY", "BESTBUY", "BOOKING", "BROTHER", "BUGATTI", "CAPITAL", "CARAVAN", "CAREERS", "CARTIER", "CHANNEL", "CHARITY", "CHINTAI", "CITADEL", "CLUBMED", "COLLEGE", "COLOGNE", "COMCAST", "COMPANY", "COMPARE", "CONTACT", "COOKING", "CORSICA", "COUNTRY", "COUPONS", "COURSES", "CRICKET", "CRUISES", "DENTIST", "DIGITAL", "DOMAINS", "EXPOSED", "EXPRESS", "FARMERS", "FASHION", "FERRARI", "FERRERO", "FINANCE", "FISHING", "FITNESS", "FLIGHTS", "FLORIST", "FLOWERS", "FORSALE", "FROGANS", "FUJITSU", "GALLERY", "GENTING", "GODADDY", "GROCERY", "GUITARS", "HAMBURG", "HANGOUT", "HITACHI", "HOLIDAY", "HOSTING", "HOTELES", "HOTMAIL", "HYUNDAI", "ISELECT", "ISMAILI", "JEWELRY", "JUNIPER", "KITCHEN", "KOMATSU", "LACAIXA", "LANCOME", "LANXESS", "LASALLE", "LATROBE", "LECLERC", "LIAISON", "LIMITED", "LINCOLN", "MARKETS", "METLIFE", "MONSTER", "NETBANK", "NETFLIX", "NETWORK", "NEUSTAR", "OKINAWA", "OLDNAVY", "ORGANIC", "ORIGINS", "PHILIPS", "PIONEER", "POLITIE", "REALTOR", "RECIPES", "RENTALS", "REVIEWS", "REXROTH", "SAMSUNG", "SANDVIK", "SCHMIDT", "SCHWARZ", "SCIENCE", "SHIKSHA", "SHRIRAM", "SINGLES", "SPIEGEL", "STAPLES", "STARHUB", "STORAGE", "SUPPORT", "SURGERY", "SYSTEMS", "TEMASEK", "THEATER", "THEATRE", "TICKETS", "TIFFANY", "TOSHIBA", "TRADING", "WALMART", "WANGGOU", "WATCHES", "WEATHER", "WEBSITE", "WEDDING", "WHOSWHO", "WINDOWS", "WINNERS", "XFINITY", "YAMAXUN", "YOUTUBE", "ZUERICH", "ABARTH", "ABBOTT", "ABBVIE", "ACTIVE", "AFRICA", "AGENCY", "AIRBUS", "AIRTEL", "ALIPAY", "ALSACE", "ALSTOM", "ANQUAN", "ARAMCO", "AUTHOR", "BAYERN", "BEAUTY", "BERLIN", "BHARTI", "BLANCO", "BOSTIK", "BOSTON", "BROKER", "CAMERA", "CAREER", "CASEIH", "CASINO", "CENTER", "CHANEL", "CHROME", "CHURCH", "CIRCLE", "CLAIMS", "CLINIC", "COFFEE", "COMSEC", "CONDOS", "COUPON", "CREDIT", "CRUISE", "DATING", "DATSUN", "DEALER", "DEGREE", "DENTAL", "DESIGN", "DIRECT", "DOCTOR", "DUNLOP", "DUPONT", "DURBAN", "EMERCK", "ENERGY", "ESTATE", "EVENTS", "EXPERT", "FAMILY", "FLICKR", "FUTBOL", "GALLUP", "GARDEN", "GEORGE", "GIVING", "GLOBAL", "GOOGLE", "GRATIS", "HEALTH", "HERMES", "HIPHOP", "HOCKEY", "HOTELS", "HUGHES", "IMAMAT", "INSURE", "INTUIT", "JAGUAR", "JOBURG", "JUEGOS", "KAUFEN", "KINDER", "KINDLE", "KOSHER", "LANCIA", "LATINO", "LAWYER", "LEFRAK", "LIVING", "LOCKER", "LONDON", "LUXURY", "MADRID", "MAISON", "MAKEUP", "MARKET", "MATTEL", "MOBILE", "MOBILY", "MONASH", "MORMON", "MOSCOW", "MUSEUM", "MUTUAL", "NAGOYA", "NATURA", "NISSAN", "NISSAY", "NORTON", "NOWRUZ", "OFFICE", "OLAYAN", "ONLINE", "ORACLE", "ORANGE", "OTSUKA", "PFIZER", "PHOTOS", "PHYSIO", "PIAGET", "PICTET", "QUEBEC", "RACING", "REALTY", "REISEN", "REPAIR", "REPORT", "REVIEW", "ROCHER", "ROGERS", "RYUKYU", "SAFETY", "SAKURA", "SANOFI", "SCHOOL", "SCHULE", "SEARCH", "SECURE", "SELECT", "SHOUJI", "SOCCER", "SOCIAL", "STREAM", "STUDIO", "SUPPLY", "SUZUKI", "SWATCH", "SYDNEY", "TAIPEI", "TAOBAO", "TARGET", "TATTOO", "TENNIS", "TIENDA", "TJMAXX", "TKMAXX", "TOYOTA", "TRAVEL", "UNICOM", "VIAJES", "VIKING", "VILLAS", "VIRGIN", "VISION", "VOTING", "VOYAGE", "VUELOS", "WALTER", "WARMAN", "WEBCAM", "XIHUAN", "YACHTS", "YANDEX", "ZAPPOS", "ACTOR", "ADULT", "AETNA", "AMFAM", "AMICA", "APPLE", "ARCHI", "AUDIO", "AUTOS", "AZURE", "BAIDU", "BEATS", "BIBLE", "BINGO", "BLACK", "BOATS", "BOSCH", "BUILD", "CANON", "CARDS", "CHASE", "CHEAP", "CISCO", "CITIC", "CLICK", "CLOUD", "COACH", "CODES", "CROWN", "CYMRU", "DABUR", "DANCE", "DEALS", "DELTA", "DODGE", "DRIVE", "DUBAI", "EARTH", "EDEKA", "EMAIL", "EPOST", "EPSON", "FAITH", "FEDEX", "FINAL", "FOREX", "FORUM", "GALLO", "GAMES", "GIFTS", "GIVES", "GLADE", "GLASS", "GLOBO", "GMAIL", "GREEN", "GRIPE", "GROUP", "GUCCI", "GUIDE", "HOMES", "HONDA", "HORSE", "HOUSE", "HYATT", "IKANO", "INTEL", "IRISH", "IVECO", "JETZT", "KOELN", "KYOTO", "LAMER", "LEASE", "LEGAL", "LEXUS", "LILLY", "LINDE", "LIPSY", "LIXIL", "LOANS", "LOCUS", "LOTTE", "LOTTO", "LUPIN", "MACYS", "MANGO", "MEDIA", "MIAMI", "MONEY", "MOPAR", "MOVIE", "NADEX", "NEXUS", "NIKON", "NINJA", "NOKIA", "NOWTV", "OMEGA", "OSAKA", "PARIS", "PARTS", "PARTY", "PHONE", "PHOTO", "PIZZA", "PLACE", "POKER", "PRAXI", "PRESS", "PRIME", "PROMO", "QUEST", "RADIO", "REHAB", "REISE", "RICOH", "ROCKS", "RODEO", "RUGBY", "SALON", "SENER", "SEVEN", "SHARP", "SHELL", "SHOES", "SKYPE", "SLING", "SMART", "SMILE", "SOLAR", "SPACE", "SPORT", "STADA", "STORE", "STUDY", "STYLE", "SUCKS", "SWISS", "TATAR", "TIRES", "TIROL", "TMALL", "TODAY", "TOKYO", "TOOLS", "TORAY", "TOTAL", "TOURS", "TRADE", "TRUST", "TUNES", "TUSHU", "UBANK", "VEGAS", "VIDEO", "VODKA", "VOLVO", "WALES", "WATCH", "WEBER", "WEIBO", "WORKS", "WORLD", "XEROX", "YAHOO", "ZIPPO", "local", "onion", "AARP", "ABLE", "ADAC", "AERO", "AIGO", "AKDN", "ALLY", "AMEX", "ARAB", "ARMY", "ARPA", "ARTE", "ASDA", "ASIA", "AUDI", "AUTO", "BABY", "BAND", "BANK", "BBVA", "BEER", "BEST", "BIKE", "BING", "BLOG", "BLUE", "BOFA", "BOND", "BOOK", "BUZZ", "CAFE", "CALL", "CAMP", "CARE", "CARS", "CASA", "CASE", "CASH", "CBRE", "CERN", "CHAT", "CITI", "CITY", "CLUB", "COOL", "COOP", "CYOU", "DATA", "DATE", "DCLK", "DEAL", "DELL", "DESI", "DIET", "DISH", "DOCS", "DOHA", "DUCK", "DUNS", "DVAG", "ERNI", "FAGE", "FAIL", "FANS", "FARM", "FAST", "FIAT", "FIDO", "FILM", "FIRE", "FISH", "FLIR", "FOOD", "FORD", "FREE", "FUND", "GAME", "GBIZ", "GENT", "GGEE", "GIFT", "GMBH", "GOLD", "GOLF", "GOOG", "GUGE", "GURU", "HAIR", "HAUS", "HDFC", "HELP", "HERE", "HGTV", "HOST", "HSBC", "ICBC", "IEEE", "IMDB", "IMMO", "INFO", "ITAU", "JAVA", "JEEP", "JOBS", "JPRS", "KDDI", "KIWI", "KPMG", "KRED", "LAND", "LEGO", "LGBT", "LIDL", "LIFE", "LIKE", "LIMO", "LINK", "LIVE", "LOAN", "LOFT", "LOVE", "LTDA", "LUXE", "MAIF", "MEET", "MEME", "MENU", "MINI", "MINT", "MOBI", "MODA", "MOTO", "NAME", "NAVY", "NEWS", "NEXT", "NICO", "NIKE", "OLLO", "OPEN", "PAGE", "PARS", "PCCW", "PICS", "PING", "PINK", "PLAY", "PLUS", "POHL", "PORN", "POST", "PROD", "PROF", "QPON", "RAID", "READ", "REIT", "RENT", "REST", "RICH", "RMIT", "ROOM", "RSVP", "RUHR", "SAFE", "SALE", "SARL", "SAVE", "SAXO", "SCOR", "SCOT", "SEAT", "SEEK", "SEXY", "SHAW", "SHIA", "SHOP", "SHOW", "SILK", "SINA", "SITE", "SKIN", "SNCF", "SOHU", "SONG", "SONY", "SPOT", "STAR", "SURF", "TALK", "TAXI", "TEAM", "TECH", "TEVA", "TIAA", "TIPS", "TOWN", "TOYS", "TUBE", "VANA", "VISA", "VIVA", "VIVO", "VOTE", "VOTO", "WANG", "WEIR", "WIEN", "WIKI", "WINE", "WORK", "XBOX", "YOGA", "ZARA", "ZERO", "ZONE", "exit", "zkey", "AAA", "ABB", "ABC", "ACO", "ADS", "AEG", "AFL", "AIG", "ANZ", "AOL", "APP", "ART", "AWS", "AXA", "BAR", "BBC", "BBT", "BCG", "BCN", "BET", "BID", "BIO", "BIZ", "BMS", "BMW", "BNL", "BOM", "BOO", "BOT", "BOX", "BUY", "BZH", "CAB", "CAL", "CAM", "CAR", "CAT", "CBA", "CBN", "CBS", "CEB", "CEO", "CFA", "CFD", "COM", "CRS", "CSC", "DAD", "DAY", "DDS", "DEV", "DHL", "DIY", "DNP", "DOG", "DOT", "DTV", "DVR", "EAT", "ECO", "EDU", "ESQ", "EUS", "FAN", "FIT", "FLY", "FOO", "FOX", "FRL", "FTR", "FUN", "FYI", "GAL", "GAP", "GDN", "GEA", "GLE", "GMO", "GMX", "GOO", "GOP", "GOT", "GOV", "HBO", "HIV", "HKT", "HOT", "HOW", "IBM", "ICE", "ICU", "IFM", "INC", "ING", "INK", "INT", "IST", "ITV", "JCB", "JCP", "JIO", "JLL", "JMP", "JNJ", "JOT", "JOY", "KFH", "KIA", "KIM", "KPN", "KRD", "LAT", "LAW", "LDS", "LLC", "LOL", "LPL", "LTD", "MAN", "MAP", "MBA", "MED", "MEN", "MIL", "MIT", "MLB", "MLS", "MMA", "MOE", "MOI", "MOM", "MOV", "MSD", "MTN", "MTR", "NAB", "NBA", "NEC", "NET", "NEW", "NFL", "NGO", "NHK", "NOW", "NRA", "NRW", "NTT", "NYC", "OBI", "OFF", "ONE", "ONG", "ONL", "OOO", "ORG", "OTT", "OVH", "PAY", "PET", "PHD", "PID", "PIN", "PNC", "PRO", "PRU", "PUB", "PWC", "QVC", "RED", "REN", "RIL", "RIO", "RIP", "RUN", "RWE", "SAP", "SAS", "SBI", "SBS", "SCA", "SCB", "SES", "SEW", "SEX", "SFR", "SKI", "SKY", "SOY", "SRL", "SRT", "STC", "TAB", "TAX", "TCI", "TDK", "TEL", "THD", "TJX", "TOP", "TRV", "TUI", "TVS", "UBS", "UNO", "UOL", "UPS", "VET", "VIG", "VIN", "VIP", "WED", "WIN", "WME", "WOW", "WTC", "WTF", "XIN", "XXX", "XYZ", "YOU", "YUN", "ZIP", "bit", "gnu", "i2p", "AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BM", "BN", "BO", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "ER", "ES", "ET", "EU", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "ST", "SU", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UK", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"];

    const gtld = `(?:${[...tlds].join('|')})`;
    const unicodeShortcuts = {
        'p{L}':
            '\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0800-\\u0815\\u081A\\u0824\\u0828\\u0840-\\u0858\\u08A0\\u08A2-\\u08AC\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0CF1\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10C7\\u10CD\\u10D0-\\u10FA\\u10FC-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1AA7\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5\\u1CF6\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u209C\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2183\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4\\u2CEB-\\u2CEE\\u2CF2\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\u2D30-\\u2D67\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005\\u3006\\u3031-\\u3035\\u303B\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA48C\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA66E\\uA67F-\\uA697\\uA6A0-\\uA6E5\\uA717-\\uA71F\\uA722-\\uA788\\uA78B-\\uA78E\\uA790-\\uA793\\uA7A0-\\uA7AA\\uA7F8-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9CF\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADD\\uAAE0-\\uAAEA\\uAAF2-\\uAAF4\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC',
        'p{N}':
            '\\u0030-\\u0039\\u00B2\\u00B3\\u00B9\\u00BC-\\u00BE\\u0660-\\u0669\\u06F0-\\u06F9\\u07C0-\\u07C9\\u0966-\\u096F\\u09E6-\\u09EF\\u09F4-\\u09F9\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F\\u0B72-\\u0B77\\u0BE6-\\u0BF2\\u0C66-\\u0C6F\\u0C78-\\u0C7E\\u0CE6-\\u0CEF\\u0D66-\\u0D75\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F33\\u1040-\\u1049\\u1090-\\u1099\\u1369-\\u137C\\u16EE-\\u16F0\\u17E0-\\u17E9\\u17F0-\\u17F9\\u1810-\\u1819\\u1946-\\u194F\\u19D0-\\u19DA\\u1A80-\\u1A89\\u1A90-\\u1A99\\u1B50-\\u1B59\\u1BB0-\\u1BB9\\u1C40-\\u1C49\\u1C50-\\u1C59\\u2070\\u2074-\\u2079\\u2080-\\u2089\\u2150-\\u2182\\u2185-\\u2189\\u2460-\\u249B\\u24EA-\\u24FF\\u2776-\\u2793\\u2CFD\\u3007\\u3021-\\u3029\\u3038-\\u303A\\u3192-\\u3195\\u3220-\\u3229\\u3248-\\u324F\\u3251-\\u325F\\u3280-\\u3289\\u32B1-\\u32BF\\uA620-\\uA629\\uA6E6-\\uA6EF\\uA830-\\uA835\\uA8D0-\\uA8D9\\uA900-\\uA909\\uA9D0-\\uA9D9\\uAA50-\\uAA59\\uABF0-\\uABF9\\uFF10-\\uFF19',
        'p{Sc}':
            '\\u0024\\u00A2-\\u00A5\\u058F\\u060B\\u09F2\\u09F3\\u09FB\\u0AF1\\u0BF9\\u0E3F\\u17DB\\u20A0-\\u20B9\\uA838\\uFDFC\\uFE69\\uFF04\\uFFE0\\uFFE1\\uFFE5\\uFFE6',
        'p{Sk}':
            '\\u005E\\u0060\\u00A8\\u00AF\\u00B4\\u00B8\\u02C2-\\u02C5\\u02D2-\\u02DF\\u02E5-\\u02EB\\u02ED\\u02EF-\\u02FF\\u0375\\u0384\\u0385\\u1FBD\\u1FBF-\\u1FC1\\u1FCD-\\u1FCF\\u1FDD-\\u1FDF\\u1FED-\\u1FEF\\u1FFD\\u1FFE\\u309B\\u309C\\uA700-\\uA716\\uA720\\uA721\\uA789\\uA78A\\uFBB2-\\uFBC1\\uFF3E\\uFF40\\uFFE3',
        'p{So}':
            '\\u00A6\\u00A9\\u00AE\\u00B0\\u0482\\u060E\\u060F\\u06DE\\u06E9\\u06FD\\u06FE\\u07F6\\u09FA\\u0B70\\u0BF3-\\u0BF8\\u0BFA\\u0C7F\\u0D79\\u0F01-\\u0F03\\u0F13\\u0F15-\\u0F17\\u0F1A-\\u0F1F\\u0F34\\u0F36\\u0F38\\u0FBE-\\u0FC5\\u0FC7-\\u0FCC\\u0FCE\\u0FCF\\u0FD5-\\u0FD8\\u109E\\u109F\\u1390-\\u1399\\u1940\\u19DE-\\u19FF\\u1B61-\\u1B6A\\u1B74-\\u1B7C\\u2100\\u2101\\u2103-\\u2106\\u2108\\u2109\\u2114\\u2116\\u2117\\u211E-\\u2123\\u2125\\u2127\\u2129\\u212E\\u213A\\u213B\\u214A\\u214C\\u214D\\u214F\\u2195-\\u2199\\u219C-\\u219F\\u21A1\\u21A2\\u21A4\\u21A5\\u21A7-\\u21AD\\u21AF-\\u21CD\\u21D0\\u21D1\\u21D3\\u21D5-\\u21F3\\u2300-\\u2307\\u230C-\\u231F\\u2322-\\u2328\\u232B-\\u237B\\u237D-\\u239A\\u23B4-\\u23DB\\u23E2-\\u23F3\\u2400-\\u2426\\u2440-\\u244A\\u249C-\\u24E9\\u2500-\\u25B6\\u25B8-\\u25C0\\u25C2-\\u25F7\\u2600-\\u266E\\u2670-\\u26FF\\u2701-\\u2767\\u2794-\\u27BF\\u2800-\\u28FF\\u2B00-\\u2B2F\\u2B45\\u2B46\\u2B50-\\u2B59\\u2CE5-\\u2CEA\\u2E80-\\u2E99\\u2E9B-\\u2EF3\\u2F00-\\u2FD5\\u2FF0-\\u2FFB\\u3004\\u3012\\u3013\\u3020\\u3036\\u3037\\u303E\\u303F\\u3190\\u3191\\u3196-\\u319F\\u31C0-\\u31E3\\u3200-\\u321E\\u322A-\\u3247\\u3250\\u3260-\\u327F\\u328A-\\u32B0\\u32C0-\\u32FE\\u3300-\\u33FF\\u4DC0-\\u4DFF\\uA490-\\uA4C6\\uA828-\\uA82B\\uA836\\uA837\\uA839\\uAA77-\\uAA79\\uFDFD\\uFFE4\\uFFE8\\uFFED\\uFFEE\\uFFFC\\uFFFD',
    };
    const letter = unicodeShortcuts['p{L}'];
    const number = unicodeShortcuts['p{N}'];
    const iriChar = letter + number;
    const pathChar = `${iriChar}/\\-+=_&~*%@|#.,:;'?!${unicodeShortcuts['p{Sc}']}${unicodeShortcuts['p{Sk}']}${unicodeShortcuts['p{So}']}`;
    const endChar = `${iriChar}/\\-+=_&~*%;${unicodeShortcuts['p{Sc}']}`;
    const octet = '(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])';
    const ipAddr = `(?:\\b${octet}\\.${octet}\\.${octet}\\.${octet}\\b)`;
    const iri = `[${iriChar}](?:[${iriChar}\\-]*[${iriChar}])?`;
    const domain = `(?:${iri}\\.)+`;
    const hostName = `(?:${domain}${gtld}|${ipAddr})`;
    const wellBrack = `\\[[${pathChar}]*(?:\\[[${pathChar}]*\\][${pathChar}]*)*\\]`;
    const wellParen = `\\([${pathChar}]*(?:\\([${pathChar}]*\\)[${pathChar}]*)*\\)`;
    const wellAll = `${wellParen}|${wellBrack}`;
    const pathCont = `(?:[${pathChar}]*(?:${wellAll}|[${endChar}])+)+`;
    const path = `(?:${pathCont}|/|\\b|$)`;
    const port = '(?::[0-9]+)?';
    const webURL = `(?:${hostName}${port}/${path})|(?:${hostName}${port}(?:\\b|$))`;
    const scheme = '(https?|ftp|wss?)://';
    const strict = `\\b${scheme}${pathCont}`;
    const relaxed = `${strict}|${webURL}`;
    const linkRegex = new RegExp(relaxed, 'gi');

    let emotes = null;
    async function getEmotes() {
        if (!emotes || !emotes.length) {
            const styleLink = await UTIL.waitForCSS("emotes.css");
            const emotesUrl = styleLink.href.replace(".css", ".json");
            const res = await fetch(emotesUrl);
            const emotesJson = await res.json();
            emotes = emotesJson.map(emote => emote.prefix);
        }
        return emotes;
    }
    let emoteRegex = null; // Cache emote regex (could be long)
    async function getEmoteRegex() {
        if (!emoteRegex || !emotes || !emotes.length) {
            const emotes = await getEmotes();
            emoteRegex = new RegExp(`(^|\\s)(${emotes.join('|')})(?=$|\\s)`, 'gm');
        }
        return emoteRegex;
    }

    // Stolen directly from hashlinkconverter.js in dgg chat-gui
    class HashLinkConverter {
        constructor() {
            this.hasHttp = /^http[s]?:\/{0,2}/;
            this.youtubeRegex = /^(?:shorts|live|embed)\/([A-Za-z0-9-_]{11})$/;
            this.twitchClipRegex = /^[^/]+\/clip\/([A-Za-z0-9-_]*)$/;
            this.twitchVODRegex = /^videos\/(\d+)$/;
            this.rumbleEmbedRegex = /^embed\/([a-z0-9]+)\/?$/;
        }

        convert(urlString) {
            if (!urlString) {
                throw new Error(MISSING_ARG_ERROR);
            }
            const url = new URL(
                // if a url doesn't have a protocol, URL throws an error
                urlString.match(this.hasHttp) ? urlString : `https://${urlString}`,
            );
            const pathname = url.pathname.slice(1);
            let match;
            let videoId;
            let timestamp;
            switch (url.hostname) {
                case 'www.twitch.tv':
                case 'twitch.tv':
                    match = pathname.match(this.twitchClipRegex);
                    if (match) {
                        return `#twitch-clip/${match[1]}`;
                    }
                    match = pathname.match(this.twitchVODRegex);
                    if (match) {
                        return `#twitch-vod/${match[1]}`;
                    }
                    return `#twitch/${pathname}`;
                case 'clips.twitch.tv':
                    return `#twitch-clip/${pathname}`;
                case 'www.youtube.com':
                case 'youtube.com':
                    match = pathname.match(this.youtubeRegex);
                    timestamp = url.searchParams.get('t');
                    videoId = url.searchParams.get('v') ?? match?.[1];
                    if (!videoId) {
                        throw new Error(MISSING_VIDEO_ID_ERROR);
                    }
                    return timestamp
                        ? `#youtube/${videoId}?t=${timestamp}`
                        : `#youtube/${videoId}`;
                case 'www.youtu.be':
                case 'youtu.be':
                    timestamp = url.searchParams.get('t');
                    return timestamp
                        ? `#youtube/${pathname}?t=${timestamp}`
                        : `#youtube/${pathname}`;
                case 'www.rumble.com':
                case 'rumble.com':
                    match = pathname.match(this.rumbleEmbedRegex);
                    if (match) {
                        return `#rumble/${match[1]}`;
                    }
                    throw new Error(RUMBLE_EMBED_ERROR);
                case 'www.kick.com':
                case 'kick.com':
                    if (url.searchParams.has('clip') || pathname.startsWith('video/')) {
                        throw new Error(INVALID_LINK_ERROR);
                    }
                    return `#kick/${pathname}`;
                default:
                    throw new Error(INVALID_LINK_ERROR);
            }
        }
    }
    const hashlinkConverter = new HashLinkConverter();

    function encodeLinkUrl(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, (v) => {
                const hi = v.charCodeAt(0);
                const low = v.charCodeAt(1);
                return `&#${(hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000};`;
            })
            .replace(/([^#-~| |!])/g, (v) => `&#${v.charCodeAt(0)};`)
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    function renderUrlEmbed(str) {
        let extraclass = '';

        if (/\b(?:NSFL)\b/i.test(str)) extraclass = 'nsfl-link';
        else if (/\b(?:NSFW)\b/i.test(str)) extraclass = 'nsfw-link';
        else if (/\b(?:SPOILERS)\b/i.test(str)) extraclass = 'spoilers-link';

        return str.replace(linkRegex, (url, scheme) => {
            const decodedUrl = url;
            const m = decodedUrl.match(linkRegex);
            if (m) {
                const normalizedUrl = encodeLinkUrl(normalizeUrl(m[0]));

                let embedHashLink = '';
                try {
                    embedHashLink = hashlinkConverter.convert(decodedUrl);
                } catch { }

                const maxUrlLength = 90;
                let urlText = normalizedUrl;
                if (
                    !(document.querySelector('input[name="showentireurl"]')?.checked ?? false) &&
                    urlText.length > maxUrlLength
                ) {
                    urlText = `${urlText.slice(0, 40)}...${urlText.slice(-40)}`;
                }

                const extra = encodeLinkUrl(decodedUrl.substring(m[0].length));
                const href = `${scheme ? '' : 'http://'}${normalizedUrl}`;

                const embedTarget = window.top !== this ? '_top' : '_blank';
                const embedUrl = window.location.origin + '/bigscreen' + embedHashLink;
                return embedHashLink
                    ? `<a target="_blank" class="externallink ${extraclass}" href="${href}" rel="nofollow">${urlText}</a><a target="${embedTarget}" class="embed-button" href="${embedUrl}"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="14.4" viewBox="0 0 640 512"><path d="M64 64V352H576V64H64zM0 64C0 28.7 28.7 0 64 0H576c35.3 0 64 28.7 64 64V352c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM128 448H512c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32-14.3-32-32s14.3-32 32-32z"  fill="#fff"/></svg></a>`
                    : `<a target="_blank" class="externallink ${extraclass}" href="${href}" rel="nofollow">${urlText}</a>${extra}`;
            }
            return url;
        });
    }
    function normalizeUrl(url) {
        if (/(x|twitter)\.com\/\w{1,15}\/status\/\d{2,19}\?/i.test(url)) return url.split('?')[0];
        if (/^(?:(?:https|http):\/\/)?(?:www\.)?youtu(?:be\.com|\.be)/i.test(url)) {
            try {
                const ytLink = new URL(url);
                ytLink.searchParams.delete('si');
                return ytLink.href;
            } catch {
                return url;
            }
        }
        return url;
    }

    const embedRegex = /(^|\s)(#(kick|twitch|twitch-vod|twitch-clip|youtube|youtube-live|facebook|rumble|vimeo)\/([\w\d]{3,64}\/videos\/\d{10,20}|[\w-]{3,64}|\w{7}\/\?pub=\w{5})(?:\?t=(\d+)s?)?)\b/g;
    async function renderChatMessage(str) {
        let htmlString = str;

        if (htmlString.startsWith('/me ')) htmlString = htmlString.slice(4);

        // Greentext
        if (str.indexOf('>') === 0) htmlString = `<span class="greentext">${htmlString}</span>`;

        // Emotes
        const regex = await getEmoteRegex();
        htmlString = htmlString.replace(regex, '$1<div title="$2" class="emote $2">$2 </div>');

        // Slash embeds
        let extraclass = '';
        if (/\b(?:NSFL)\b/i.test(str)) extraclass = 'nsfl-link';
        else if (/\b(?:NSFW)\b/i.test(str)) extraclass = 'nsfw-link';
        else if (/\b(?:SPOILERS)\b/i.test(str)) extraclass = 'spoilers-link';

        const target = window.top !== this ? '_top' : '_blank';
        const baseUrl = window.location.origin + '/bigscreen';
        htmlString = htmlString.replace(embedRegex, `$1<a class="externallink bookmarklink ${extraclass}" href="${baseUrl}$2" target="${target}">$2</a>`);

        // Links
        htmlString = renderUrlEmbed(htmlString);

        return htmlString;
    }

    return { renderChatMessage };
})();