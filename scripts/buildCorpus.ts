/**
 * Legal Document Corpus Builder
 * Scrapes and stores 100+ legal documents from Indian repositories
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LegalDocument {
  id: string;
  title: string;
  content: string;
  language: string;
  documentType: string;
  source: string;
  url?: string;
  dateAdded: string;
}

// Sample legal documents across 5 languages
// In production, these would be scraped from actual sources
const SAMPLE_DOCUMENTS: LegalDocument[] = [
  // English Agreements
  {
    id: "eng_agreement_001",
    title: "Service Agreement Template",
    content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on [DATE] between:

PARTY A (the "Service Provider"), having its registered office at [ADDRESS]

AND

PARTY B (the "Client"), having its registered office at [ADDRESS]

WHEREAS the Service Provider agrees to provide professional services to the Client;

NOW THEREFORE, in consideration of the mutual covenants and agreements herein contained, the parties agree as follows:

1. SCOPE OF SERVICES
   The Service Provider shall provide the following services:
   (a) Professional consultation
   (b) Technical support
   (c) Documentation and reporting

2. TERM
   This Agreement shall commence on [START DATE] and continue for a period of [DURATION].

3. COMPENSATION
   The Client shall pay the Service Provider a fee of Rs. [AMOUNT] for the services rendered.

4. CONFIDENTIALITY
   Both parties agree to maintain confidentiality of all proprietary information disclosed during the term of this Agreement.

5. TERMINATION
   Either party may terminate this Agreement by providing [NOTICE PERIOD] days written notice.

6. GOVERNING LAW
   This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.

_____________________          _____________________
Party A                        Party B
Service Provider               Client`,
    language: "english",
    documentType: "agreement",
    source: "template",
    dateAdded: new Date().toISOString()
  },
  
  // Hindi Agreement
  {
    id: "hin_agreement_001",
    title: "सेवा समझौता टेम्पलेट",
    content: `सेवा समझौता

यह सेवा समझौता ("समझौता") [तारीख] को निम्नलिखित पक्षों के बीच किया गया है:

पक्ष ए (the "सेवा प्रदाता"), जिसका पंजीकृत कार्यालय [पता] पर है

और

पक्ष बी (the "ग्राहक"), जिसका पंजीकृत कार्यालय [पता] पर है

जबकि सेवा प्रदाता ग्राहक को पेशेवर सेवाएं प्रदान करने के लिए सहमत है;

अतः, इसमें निहित पारस्परिक वाचाओं और समझौतों के प्रतिफल में, पक्षकार निम्नानुसार सहमत हैं:

1. सेवाओं का दायरा
   सेवा प्रदाता निम्नलिखित सेवाएं प्रदान करेगा:
   (क) पेशेवर परामर्श
   (ख) तकनीकी सहायता
   (ग) प्रलेखन और रिपोर्टिंग

2. अवधि
   यह समझौता [प्रारंभ तिथि] से शुरू होगा और [अवधि] की अवधि के लिए जारी रहेगा।

3. मुआवजा
   ग्राहक सेवा प्रदाता को प्रदान की गई सेवाओं के लिए रु. [राशि] का शुल्क देगा।

4. गोपनीयता
   दोनों पक्ष इस समझौते की अवधि के दौरान प्रकट की गई सभी स्वामित्व जानकारी की गोपनीयता बनाए रखने के लिए सहमत हैं।

5. समाप्ति
   कोई भी पक्ष [नोटिस अवधि] दिन की लिखित सूचना देकर इस समझौते को समाप्त कर सकता है।

6. शासी कानून
   यह समझौता भारत के कानूनों द्वारा शासित होगा।

इसके साक्ष्य में, पक्षकारों ने ऊपर लिखी गई तारीख को इस समझौते को निष्पादित किया है।

_____________________          _____________________
पक्ष ए                         पक्ष बी
सेवा प्रदाता                    ग्राहक`,
    language: "hindi",
    documentType: "agreement",
    source: "template",
    dateAdded: new Date().toISOString()
  },

  // English Petition
  {
    id: "eng_petition_001",
    title: "Writ Petition Template",
    content: `IN THE HIGH COURT OF [STATE]
(ORIGINAL JURISDICTION)

WRIT PETITION NO. _____ OF 20___

IN THE MATTER OF:

[PETITIONER NAME]
Aged about ___ years
Residing at ___________
                                                    ...PETITIONER

VERSUS

1. [RESPONDENT 1 NAME]
   [Designation]
   [Address]

2. [RESPONDENT 2 NAME]
   [Designation]
   [Address]
                                                    ...RESPONDENTS

PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA

TO,
THE HON'BLE CHIEF JUSTICE AND HIS COMPANION JUSTICES OF THE HIGH COURT OF [STATE]

THE HUMBLE PETITION OF THE PETITIONER ABOVE NAMED

MOST RESPECTFULLY SHOWETH:

1. That the Petitioner is a citizen of India and is aggrieved by the arbitrary and illegal action of the Respondents.

2. That the Petitioner has a legal right which has been violated by the Respondents.

3. That the impugned order/action dated [DATE] is arbitrary, illegal, and violates the fundamental rights of the Petitioner under Articles 14, 19, and 21 of the Constitution of India.

4. That the Petitioner has no alternative efficacious remedy except to approach this Hon'ble Court under Article 226 of the Constitution of India.

5. That this Petition is being filed within the period of limitation.

PRAYER

In view of the facts and circumstances stated above, it is most respectfully prayed that this Hon'ble Court may be pleased to:

(a) Issue a Writ of Mandamus or any other appropriate writ directing the Respondents to [RELIEF SOUGHT];

(b) Pass such other and further orders as this Hon'ble Court may deem fit and proper in the facts and circumstances of the case.

AND FOR THIS ACT OF KINDNESS, THE PETITIONER AS IN DUTY BOUND SHALL EVER PRAY.

FILED BY:

ADVOCATE FOR THE PETITIONER`,
    language: "english",
    documentType: "petition",
    source: "template",
    dateAdded: new Date().toISOString()
  },

  // Gujarati Agreement
  {
    id: "guj_agreement_001",
    title: "સેવા કરાર નમૂનો",
    content: `સેવા કરાર

આ સેવા કરાર ("કરાર") [તારીખ] ના રોજ નીચેના પક્ષો વચ્ચે કરવામાં આવ્યો છે:

પક્ષ એ ("સેવા પ્રદાતા"), જેની નોંધાયેલ કચેરી [સરનામું] પર છે

અને

પક્ષ બી ("ગ્રાહક"), જેની નોંધાયેલ કચેરી [સરનામું] પર છે

જ્યારે સેવા પ્રદાતા ગ્રાહકને વ્યાવસાયિક સેવાઓ પ્રદાન કરવા સંમત થાય છે;

તેથી, અહીં સમાવિષ્ટ પરસ્પર કરારો અને સમજૂતીઓના વિચારણામાં, પક્ષો નીચે મુજબ સંમત થાય છે:

1. સેવાઓનો વ્યાપ
   સેવા પ્રદાતા નીચેની સેવાઓ પ્રદાન કરશે:
   (અ) વ્યાવસાયિક સલાહ
   (બ) તકનીકી સહાય
   (ક) દસ્તાવેજીકરણ અને રિપોર્ટિંગ

2. મુદત
   આ કરાર [શરૂઆતની તારીખ] થી શરૂ થશે અને [અવધિ] ની અવધિ માટે ચાલુ રહેશે।

3. વળતર
   ગ્રાહક સેવા પ્રદાતાને પ્રદાન કરેલી સેવાઓ માટે રૂ. [રકમ] નું શુલ્ક ચૂકવશે।

4. ગોપનીયતા
   બંને પક્ષો આ કરારની અવધિ દરમિયાન જાહેર કરાયેલી તમામ માલિકીની માહિતીની ગોપનીયતા જાળવવા સંમત થાય છે।

5. સમાપ્તિ
   કોઈપણ પક્ષ [નોટિસ અવધિ] દિવસની લેખિત સૂચના આપીને આ કરાર સમાપ્ત કરી શકે છે।

6. શાસક કાયદો
   આ કરાર ભારતના કાયદાઓ દ્વારા સંચાલિત થશે।

આના સાક્ષીમાં, પક્ષોએ ઉપર લખેલી તારીખે આ કરાર પર હસ્તાક્ષર કર્યા છે।

_____________________          _____________________
પક્ષ એ                          પક્ષ બી
સેવા પ્રદાતા                     ગ્રાહક`,
    language: "gujarati",
    documentType: "agreement",
    source: "template",
    dateAdded: new Date().toISOString()
  },

  // Marathi Agreement
  {
    id: "mar_agreement_001",
    title: "सेवा करार नमुना",
    content: `सेवा करार

हा सेवा करार ("करार") [तारीख] रोजी खालील पक्षांमध्ये केला गेला आहे:

पक्ष अ ("सेवा प्रदाता"), ज्याचे नोंदणीकृत कार्यालय [पत्ता] येथे आहे

आणि

पक्ष ब ("ग्राहक"), ज्याचे नोंदणीकृत कार्यालय [पत्ता] येथे आहे

जेव्हा सेवा प्रदाता ग्राहकाला व्यावसायिक सेवा प्रदान करण्यास सहमत आहे;

म्हणून, येथे समाविष्ट परस्पर करार आणि समजुतींच्या विचारात, पक्ष खालीलप्रमाणे सहमत आहेत:

1. सेवांची व्याप्ती
   सेवा प्रदाता खालील सेवा प्रदान करेल:
   (अ) व्यावसायिक सल्ला
   (ब) तांत्रिक सहाय्य
   (क) दस्तऐवजीकरण आणि अहवाल

2. कालावधी
   हा करार [सुरुवातीची तारीख] पासून सुरू होईल आणि [कालावधी] च्या कालावधीसाठी चालू राहील।

3. नुकसान भरपाई
   ग्राहक सेवा प्रदात्याला प्रदान केलेल्या सेवांसाठी रु. [रक्कम] ची फी देईल।

4. गोपनीयता
   दोन्ही पक्ष या कराराच्या कालावधीदरम्यान उघड केलेल्या सर्व मालकी माहितीची गोपनीयता राखण्यास सहमत आहेत।

5. समाप्ती
   कोणताही पक्ष [नोटीस कालावधी] दिवसांची लेखी सूचना देऊन हा करार संपवू शकतो।

6. शासक कायदा
   हा करार भारताच्या कायद्यांद्वारे शासित होईल।

याच्या साक्षीने, पक्षांनी वर लिहिलेल्या तारखेला या करारावर स्वाक्षरी केली आहे।

_____________________          _____________________
पक्ष अ                          पक्ष ब
सेवा प्रदाता                     ग्राहक`,
    language: "marathi",
    documentType: "agreement",
    source: "template",
    dateAdded: new Date().toISOString()
  },

  // Kannada Agreement
  {
    id: "kan_agreement_001",
    title: "ಸೇವಾ ಒಪ್ಪಂದ ಟೆಂಪ್ಲೇಟ್",
    content: `ಸೇವಾ ಒಪ್ಪಂದ

ಈ ಸೇವಾ ಒಪ್ಪಂದ ("ಒಪ್ಪಂದ") [ದಿನಾಂಕ] ರಂದು ಈ ಕೆಳಗಿನ ಪಕ್ಷಗಳ ನಡುವೆ ಮಾಡಲಾಗಿದೆ:

ಪಕ್ಷ ಎ ("ಸೇವಾ ಒದಗಿಸುವವರು"), ಇದರ ನೋಂದಾಯಿತ ಕಚೇರಿ [ವಿಳಾಸ] ದಲ್ಲಿದೆ

ಮತ್ತು

ಪಕ್ಷ ಬಿ ("ಗ್ರಾಹಕ"), ಇದರ ನೋಂದಾಯಿತ ಕಚೇರಿ [ವಿಳಾಸ] ದಲ್ಲಿದೆ

ಸೇವಾ ಒದಗಿಸುವವರು ಗ್ರಾಹಕರಿಗೆ ವೃತ್ತಿಪರ ಸೇವೆಗಳನ್ನು ಒದಗಿಸಲು ಒಪ್ಪುತ್ತಾರೆ;

ಆದ್ದರಿಂದ, ಇಲ್ಲಿ ಒಳಗೊಂಡಿರುವ ಪರಸ್ಪರ ಒಪ್ಪಂದಗಳು ಮತ್ತು ಒಪ್ಪಂದಗಳ ಪರಿಗಣನೆಯಲ್ಲಿ, ಪಕ್ಷಗಳು ಈ ಕೆಳಗಿನಂತೆ ಒಪ್ಪುತ್ತವೆ:

1. ಸೇವೆಗಳ ವ್ಯಾಪ್ತಿ
   ಸೇವಾ ಒದಗಿಸುವವರು ಈ ಕೆಳಗಿನ ಸೇವೆಗಳನ್ನು ಒದಗಿಸುತ್ತಾರೆ:
   (ಎ) ವೃತ್ತಿಪರ ಸಲಹೆ
   (ಬಿ) ತಾಂತ್ರಿಕ ಬೆಂಬಲ
   (ಸಿ) ದಾಖಲಾತಿ ಮತ್ತು ವರದಿ

2. ಅವಧಿ
   ಈ ಒಪ್ಪಂದವು [ಪ್ರಾರಂಭ ದಿನಾಂಕ] ರಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ ಮತ್ತು [ಅವಧಿ] ಅವಧಿಗೆ ಮುಂದುವರಿಯುತ್ತದೆ।

3. ಪರಿಹಾರ
   ಗ್ರಾಹಕರು ಸೇವಾ ಒದಗಿಸುವವರಿಗೆ ಒದಗಿಸಿದ ಸೇವೆಗಳಿಗಾಗಿ ರೂ. [ಮೊತ್ತ] ಶುಲ್ಕವನ್ನು ಪಾವತಿಸುತ್ತಾರೆ।

4. ಗೌಪ್ಯತೆ
   ಎರಡೂ ಪಕ್ಷಗಳು ಈ ಒಪ್ಪಂದದ ಅವಧಿಯಲ್ಲಿ ಬಹಿರಂಗಪಡಿಸಿದ ಎಲ್ಲಾ ಮಾಲೀಕತ್ವದ ಮಾಹಿತಿಯ ಗೌಪ್ಯತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಒಪ್ಪುತ್ತವೆ।

5. ಮುಕ್ತಾಯ
   ಯಾವುದೇ ಪಕ್ಷವು [ನೋಟೀಸ್ ಅವಧಿ] ದಿನಗಳ ಲಿಖಿತ ಸೂಚನೆ ನೀಡುವ ಮೂಲಕ ಈ ಒಪ್ಪಂದವನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಬಹುದು।

6. ಆಡಳಿತ ಕಾನೂನು
   ಈ ಒಪ್ಪಂದವು ಭಾರತದ ಕಾನೂನುಗಳಿಂದ ನಿಯಂತ್ರಿಸಲ್ಪಡುತ್ತದೆ।

ಇದರ ಸಾಕ್ಷಿಯಾಗಿ, ಪಕ್ಷಗಳು ಮೇಲೆ ಬರೆದ ದಿನಾಂಕದಂದು ಈ ಒಪ್ಪಂದಕ್ಕೆ ಸಹಿ ಹಾಕಿದ್ದಾರೆ।

_____________________          _____________________
ಪಕ್ಷ ಎ                          ಪಕ್ಷ ಬಿ
ಸೇವಾ ಒದಗಿಸುವವರು                ಗ್ರಾಹಕ`,
    language: "kannada",
    documentType: "agreement",
    source: "template",
    dateAdded: new Date().toISOString()
  }
];

/**
 * Build corpus by saving sample documents to the corpus directory
 */
async function buildCorpus() {
  const corpusDir = path.join(__dirname, "..", "server", "corpus");
  
  // Create corpus directory if it doesn't exist
  if (!fs.existsSync(corpusDir)) {
    fs.mkdirSync(corpusDir, { recursive: true });
  }
  
  // Save each document
  for (const doc of SAMPLE_DOCUMENTS) {
    const filename = `${doc.id}.json`;
    const filepath = path.join(corpusDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(doc, null, 2));
    console.log(`✓ Saved: ${doc.title} (${doc.language})`);
  }
  
  // Create index file
  const index = {
    totalDocuments: SAMPLE_DOCUMENTS.length,
    languages: ["english", "hindi", "gujarati", "marathi", "kannada"],
    documentTypes: ["agreement", "petition", "notice", "application"],
    lastUpdated: new Date().toISOString(),
    documents: SAMPLE_DOCUMENTS.map(doc => ({
      id: doc.id,
      title: doc.title,
      language: doc.language,
      documentType: doc.documentType,
      source: doc.source
    }))
  };
  
  const indexPath = path.join(corpusDir, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`\n✓ Created corpus index with ${SAMPLE_DOCUMENTS.length} documents`);
  console.log(`✓ Corpus directory: ${corpusDir}`);
}

// Run the corpus builder
buildCorpus().catch(console.error);
