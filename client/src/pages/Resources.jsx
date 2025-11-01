import { useState } from 'react';
import { FaDownload, FaBook, FaLightbulb, FaClipboardList, FaCalendarAlt, FaPalette, FaUtensils, FaMusic } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components';

function Resources() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'planning', label: 'Event Planning' },
    { id: 'decoration', label: 'Decoration Ideas' },
    { id: 'checklists', label: 'Checklists' },
    { id: 'guides', label: 'Venue Guides' }
  ];

  const resources = [
    {
      id: 1,
      title: "Complete Wedding Planning Guide",
      description: "A comprehensive guide covering all aspects of wedding planning at our venue.",
      category: "planning",
      icon: FaBook,
      downloadLink: "#",
      type: "PDF Guide",
      size: "2.5 MB"
    },
    {
      id: 2,
      title: "Event Decoration Lookbook",
      description: "Explore our collection of decoration themes and setups for various occasions.",
      category: "decoration",
      icon: FaPalette,
      downloadLink: "#",
      type: "Digital Catalog",
      size: "5.8 MB"
    },
    {
      id: 3,
      title: "Wedding Day Timeline Template",
      description: "Customizable timeline template to help plan your perfect wedding day.",
      category: "checklists",
      icon: FaCalendarAlt,
      downloadLink: "#",
      type: "Excel Template",
      size: "1.2 MB"
    },
    {
      id: 4,
      title: "Corporate Event Planning Checklist",
      description: "Detailed checklist for organizing successful corporate events.",
      category: "checklists",
      icon: FaClipboardList,
      downloadLink: "#",
      type: "PDF Checklist",
      size: "890 KB"
    },
    {
      id: 5,
      title: "Venue Setup Guide",
      description: "Learn about our venue's layout options and setup possibilities.",
      category: "guides",
      icon: FaLightbulb,
      downloadLink: "#",
      type: "Interactive PDF",
      size: "3.2 MB"
    },
    {
      id: 6,
      title: "Catering Menu Planning Guide",
      description: "Tips and guidelines for planning your event's menu and service style.",
      category: "planning",
      icon: FaUtensils,
      downloadLink: "#",
      type: "PDF Guide",
      size: "1.8 MB"
    }
  ];


  const filteredResources = selectedCategory === 'all'
    ? resources
    : resources.filter(resource => resource.category === selectedCategory);

  const handleContactClick = () => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white py-20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10">
              Resources
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Planning Resources
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Access our collection of guides, templates, and articles to help plan your perfect event. 
            Everything you need to make your celebration a success.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          <div className="glass-effect rounded-2xl p-2 border border-white/10">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-electric text-white shadow-lg transform scale-105'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredResources.map((resource) => (
            <Card 
              key={resource.id}
              className="p-8 glass-effect border border-white/10 hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              hoverEffect={true}
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-electric rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <resource.icon className="text-3xl text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-electric-400 transition-colors mb-2">{resource.title}</h3>
                  <p className="text-sm text-neutral-400 font-medium">{resource.type} • {resource.size}</p>
                </div>
              </div>
              <p className="text-neutral-300 mb-6 leading-relaxed">{resource.description}</p>
              <Button variant="primary" className="w-full">
                <FaDownload className="mr-2" />
                Download Resource
              </Button>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="text-center p-12 glass-effect border border-white/10">
          <h3 className="text-3xl font-bold text-white mb-4">
            Need Personalized Assistance?
          </h3>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Our event planning experts are here to help you create the perfect event. Get personalized guidance and support for your special occasion.
          </p>
          <Button 
            onClick={handleContactClick}
            variant="primary"
            size="lg"
          >
            Contact Our Team
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default Resources;