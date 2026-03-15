import "./styles/Banner.css";

export default function Banner({ userName }) {
  return (
    <div className="flex flex-col items-center gap-2 pt-6 pb-2 w-full">
      <h1 className="text-[#e6f0ff] text-[32px] font-bold text-center">
        Bonjour {userName} ! Prêt pour l'aventure ?
      </h1>
      <p className="text-[#97b6c8] text-[15px] text-center">
        Dites-moi où vous voulez aller, je m'occupe des vols d'abord, puis des hébergements.
      </p>
    </div>
  );
}