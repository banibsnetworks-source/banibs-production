import React from 'react';
import SocialComingSoon from './SocialComingSoon';
import { Bookmark } from 'lucide-react';

export default function SocialSavedPage() {
  return (
    <SocialComingSoon
      section="default"
      title="Saved Posts"
      description="Bookmark and organize your favorite posts. Coming soon as part of BANIBS Connect's next phase."
      customIcon={Bookmark}
    />
  );
}