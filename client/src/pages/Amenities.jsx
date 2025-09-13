import { FaWifi, FaCar, FaSnowflake, FaShieldAlt, FaFirstAid, FaChargingStation, FaRestroom, FaHandsWash } from 'react-icons/fa';

function Amenities() {
  const amenities = [

    {
      icon: FaCar,
      title: "Spacious Parking",
      description: "Secure parking space for up to 200 vehicles with valet service available on request."
    },
 
    {
      icon: FaShieldAlt,
      title: "24/7 Security",
      description: "Round-the-clock security personnel and CCTV surveillance for your safety."
    },
    {
      icon: FaFirstAid,
      title: "Medical Assistance",
      description: "First-aid facilities and on-call medical support for emergencies."
    },

    {
      icon: FaRestroom,
      title: "Modern Restrooms",
      description: "Clean and well-maintained restroom facilities with luxury amenities."
    },
    {
      icon: FaHandsWash,
      title: "Sanitization Stations",
      description: "Hand sanitization stations placed throughout the venue for hygiene maintenance."
    }
  ];

  const specialFeatures = [
    {
      title: "Grand Entrance",
      description: "Make a stunning entrance through our beautifully designed gateway with water fountains.",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80"
    },
    {
      title: "Bridal Room",
      description: "Luxurious private room for bridal preparations with modern amenities and comfortable seating.",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80"
    },
    {
      title: "Green Spaces",
      description: "Beautifully landscaped gardens perfect for outdoor ceremonies and photography.",
      image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Venue Amenities</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience luxury and convenience with our world-class amenities. We've thought of everything to make your event comfortable and memorable.
          </p>
        </div>

        {/* Basic Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {amenities.map((amenity, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <amenity.icon className="text-3xl text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                {amenity.title}
              </h3>
              <p className="text-gray-600 text-center">
                {amenity.description}
              </p>
            </div>
          ))}
        </div>

        

        {/* Capacity Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Venue Capacity
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">1000</div>
              <p className="text-gray-600">Seating Capacity</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">200+</div>
              <p className="text-gray-600">Parking Spots</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">20,000</div>
              <p className="text-gray-600">Square Feet Area</p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default Amenities;