export interface FilterOption {
    label: string;
    key: string;
    selected: boolean;
  }
  
  export const SERVICE_FILTER_OPTIONS: FilterOption[] = [
    { label: 'Basic needs assistance', key: 'isBasicNeedsAssistance', selected: false },
    { label: 'Children services', key: 'isChildrenServices', selected: false },
    { label: 'Community outreach', key: 'isCommunityOutreach', selected: false },
    { label: 'Counseling', key: 'isCounseling', selected: false },
    { label: 'Court services', key: 'isCourtServices', selected: false },
    { label: 'Hotline', key: 'IsHotline', selected: false },
    { label: 'Medical services', key: 'isMedicalServices', selected: false },
    { label: 'Referral services', key: 'isReferralServices', selected: false },
    { label: 'Safety planning', key: 'isSafetyPlanning', selected: false },
    { label: 'Shelter', key: 'isShelter', selected: false },
    { label: 'Support groups', key: 'isSupportGroups', selected: false },
    { label: 'Translation services', key: 'isTranslationServices', selected: false },
    { label: 'Other services', key: 'isOther', selected: false }
  ];