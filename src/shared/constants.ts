import constantsData from '../assets/constants.json';

interface HealthTip {
  title: string;
  message: string;
  imageUrl?: string;
}

interface DailyPeaceTip {
  title: string;
  subtitle: string;
  message: string;
  imageUrl?: string;
}

interface Constants {
  HEALTH_TIPS: {
    DEFAULT_TIP: HealthTip;
  };
  DAILY_PEACE_TIPS: {
    DEFAULT_TIP: DailyPeaceTip;
  };
  TOAST_MESSAGES: {
    FORM_SUBMITTED_SUCCESS: string;
    FORM_SUBMITTED_ERROR: string;
  };
}

const constants: Constants = constantsData as Constants;

export const getConstant = (category: keyof Constants, key: string) => {
  const categoryData = constants[category];
  if (categoryData && (key in categoryData)) {
    return (categoryData as any)[key];
  } else {
    console.error(`Constant not found for category: ${category}, key: ${key}`);
    return undefined;
  }
};

export const ASSESSMENT_TYPE = {
  WEB: "Women's Experience with Battering"
}