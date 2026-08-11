import type { Quarry } from "../types/quarry";
import { formatINR } from "../utils/formatters";

export function generateAnomalyExplanation(quarry: Quarry, gapTonnes: number): { english: string; tamil: string } {
  const isAnomaly = gapTonnes > 0;
  if (!isAnomaly) {
    return {
      english: "No significant anomaly detected. Estimated extraction volume aligns with declared volume.",
      tamil: "எந்தவொரு குறிப்பிடத்தக்க முரண்பாடும் கண்டறியப்படவில்லை. வெட்டி எடுக்கப்பட்ட அளவு அறிவிக்கப்பட்ட அளவுடன் ஒத்துப்போகிறது.",
    };
  }

  const roundedGap = Math.round(gapTonnes);
  return {
    english: `Anomaly Detected: Satellite imagery indicates an estimated extraction volume significantly higher than the declared ${quarry.declaredExtractionVolumeM3Monthly} m³. A gap of approximately ${roundedGap} tonnes was found, suggesting unauthorized over-extraction. Immediate inspection of the ${quarry.mineralType} quarry is recommended to prevent further revenue loss.`,
    tamil: `முரண்பாடு கண்டறியப்பட்டுள்ளது: செயற்கைக்கோள் படங்கள் மதிப்பிடப்பட்ட வெட்டியெடுக்கும் அளவு அறிவிக்கப்பட்ட ${quarry.declaredExtractionVolumeM3Monthly} m³ ஐ விட கணிசமாக அதிகமாக இருப்பதைக் காட்டுகின்றன. தோராயமாக ${roundedGap} டன்கள் இடைவெளி கண்டறியப்பட்டுள்ளது, இது அங்கீகரிக்கப்படாத அதிகப்படியான வெட்டியெடுப்பைக் குறிக்கிறது. மேலும் வருவாய் இழப்பைத் தடுக்க ${quarry.mineralType} குவாரியை உடனடியாக ஆய்வு செய்ய பரிந்துரைக்கப்படுகிறது.`,
  };
}

export function draftShowCauseNotice(quarry: Quarry, gapTonnes: number, revenueLoss: number): string {
  const today = new Date().toLocaleDateString("en-IN");
  const roundedGap = Math.round(gapTonnes);

  return `GOVERNMENT OF TAMIL NADU
DEPARTMENT OF GEOLOGY AND MINING

Date: ${today}
To:
Operator ID: ${quarry.operatorId}
Quarry Name: ${quarry.name}
District: ${quarry.district}

Subject: SHOW CAUSE NOTICE - SUSPECTED OVER-EXTRACTION OF ${quarry.mineralType.toUpperCase()}

Sir/Madam,

Upon analysis of satellite imagery and drone survey data for the period ending ${today}, it has been observed that the actual extraction at your quarry site (${quarry.id}) significantly exceeds your declared volume of ${quarry.declaredExtractionVolumeM3Monthly} m³.

The AI-estimated discrepancy is approximately ${roundedGap} tonnes, resulting in an estimated royalty revenue loss of ${formatINR(revenueLoss)} to the State Exchequer.

You are hereby directed to show cause within 7 days of receipt of this notice as to why penal action should not be initiated against you under the Tamil Nadu Minor Mineral Concession Rules, 1959, and why your quarrying lease should not be suspended/cancelled.

Failure to respond within the stipulated time will result in ex-parte action without further notice.

Issued by,
Assistant Director / Deputy Director
Department of Geology and Mining
${quarry.district} District`;
}
