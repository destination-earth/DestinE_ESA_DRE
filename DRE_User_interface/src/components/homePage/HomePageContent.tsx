import factoryImg from "./assets/factory.jpg";
import satelliteImg from "./assets/satelite.jpg";
import windTurbinesImg from "./assets/windTurbines.jpg";
import logosImg from "./assets/logos.png"; 
import heroBackground from "./assets/windTurbines.jpg"; // Using windTurbines as placeholder hero background

// Placeholder logos - replace with actual imports/paths when available
// import noaLogo from '../assets/providers/noa.png';
// import wmLogo from '../assets/providers/wm.png';
// import enoraLogo from '../assets/providers/enora.png';
// import questLogo from '../assets/providers/quest.png';

const HomePageContent = () => {
  return (
    <div className="w-full bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${heroBackground})`, minHeight: "65vh" }} // Increased height
      >
        <div className="absolute inset-0 bg-black opacity-40"></div> {/* Overlay */}
        <div className="container mx-auto flex h-full flex-col items-start justify-center px-6 py-24 relative z-10">
          <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            A cutting-edge solution that digitizes the physical systems of solar and wind production.
          </h1>
          <p className="mb-8 max-w-2xl text-lg">
            The Destination Renewable Energy (DRE) Developing the Hybrid Renewable Energy Forecasting System (HYREF) demonstrator to support simulation and projection services that are part of the DestinE digital ecosystem.
          </p>
          {/* <div>
            <button className="mr-4 rounded bg-white px-6 py-2 font-semibold text-blue-600 shadow hover:bg-gray-100">
              Explore
            </button>
            <button className="rounded border border-white bg-transparent px-6 py-2 font-semibold text-white shadow hover:bg-white hover:text-blue-600">
              Learn more
            </button>
          </div> */}
        </div>
      </div>

      {/* HYREF in a nutshell Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">
          HYREF in a nutshell
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <img src={factoryImg} alt="Greenhouse gas emissions" className="h-48 w-full object-cover" />
            <div className="p-6">
              <p className="text-sm text-gray-600">
                With the increasing temperatures in the past years, immediate action is needed to reduce greenhouse gas (GHG) emissions.
              </p>
            </div>
          </div>
          {/* Card 2 */}
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <img src={satelliteImg} alt="Satellite data for climate services" className="h-48 w-full object-cover" />
            <div className="p-6">
              <p className="text-sm text-gray-600">
                Climate services and satellite data support the transition to clean energy thanks to improved climate information and services for the energy sector.
              </p>
            </div>
          </div>
          {/* Card 3 */}
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <img src={windTurbinesImg} alt="Wind turbines for energy forecasting" className="h-48 w-full object-cover" />
            <div className="p-6">
              <p className="text-sm text-gray-600">
                The Use Case is expected to provide more accurate and reliable energy forecasting through the development of the Hybrid Renewable Energy Forecasting System (HYREF), a demonstrator that aims to digitise the physical systems of solar and wind production to support simulation and projection services that are part of the DRE digital ecosystem.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Providers Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-12 text-3xl font-bold">Providers</h2>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {/* Add the single image for all logos */}
            <img 
              src={logosImg} 
              alt="Provider Logos" 
              className="max-w-full h-auto md:max-w-3xl" // Adjust styling as needed
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageContent;
