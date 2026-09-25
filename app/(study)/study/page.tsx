'use client';

import { useStudyVoiceFlow } from './_hooks/useStudyVoiceFlow';
import { StudyVoiceScene } from './_components/StudyVoiceScene';

export default function StudyPage() {
    const {
        isListening,
        isReasoning,
        speechText,
        transcript,
        displayedText,
        handleGlobalClick,
        handleGlobalContextMenu,
    } = useStudyVoiceFlow();

    return (
        <StudyVoiceScene
            isListening={isListening}
            isReasoning={isReasoning}
            speechText={speechText}
            transcript={transcript}
            displayedText={displayedText}
            onClick={handleGlobalClick}
            onContextMenu={handleGlobalContextMenu}
        />
    );
}
