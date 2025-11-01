import { FaWifi, FaCar, FaSnowflake, FaShieldAlt, FaFirstAid, FaChargingStation, FaRestroom, FaHandsWash } from 'react-icons/fa';
import { Card } from '../components';

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
    <div className="min-h-screen bg-gradient-mesh py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10">
              Our Amenities
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Venue Amenities</h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            Experience luxury and convenience with our world-class amenities. We've thought of everything to make your event comfortable and memorable.
          </p>
        </div>

        {/* Basic Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {amenities.map((amenity, index) => (
            <Card 
              key={index}
              className="p-6 glass-effect border border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              hoverEffect={true}
            >
              <div className="w-16 h-16 bg-gradient-electric rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <amenity.icon className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white text-center mb-2">
                {amenity.title}
              </h3>
              <p className="text-neutral-300 text-center">
                {amenity.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Special Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Special Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {specialFeatures.map((feature, index) => (
              <Card 
                key={index}
                className="overflow-hidden glass-effect border border-white/10"
                hoverEffect={true}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-neutral-300">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Capacity Information */}
        <Card className="p-8 glass-effect border border-white/10">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Venue Capacity
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-electric-400 mb-2">1000</div>
              <p className="text-neutral-300">Seating Capacity</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-electric-400 mb-2">200+</div>
              <p className="text-neutral-300">Parking Spots</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-electric-400 mb-2">20,000</div>
              <p className="text-neutral-300">Square Feet Area</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Amenities;