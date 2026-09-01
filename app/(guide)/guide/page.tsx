import HeroSection from "./_components/HeroSection";
import TeacherBox from "./_components/MainBox";

const page = () => {
    return (
        <div className="min-h-[calc(100dvh-5rem)] w-full bg-[linear-gradient(-35deg,#2563eb_0%,#1f2937_60%)] text-white flex flex-col items-center justify-center overflow-x-hidden relative select-none">
            <HeroSection />
            <span className="h-1 bg-gray-900 w-full"></span>
            <TeacherBox />
        </div>
    );
};

export default page;