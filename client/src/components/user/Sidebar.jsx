import { NavLink } from 'react-router-dom';

function Sidebar() {
  const sections = [
    {
      title: 'Getting Started',
      links: [
        { to: '/docs/introduction', label: 'Introduction' },
        { to: '/docs/installation', label: 'Installation' },
        { to: '/docs/quick-start', label: 'Quick Start' },
      ],
    },
    {
      title: 'Core Concepts',
      links: [
        { to: '/docs/architecture', label: 'Architecture' },
        { to: '/docs/components', label: 'Components' },
        { to: '/docs/hooks', label: 'Hooks' },
      ],
    },
  ];

  return (
    <aside className="hidden md:block w-64 flex-shrink-0">
      <div className="sticky top-8">
        {sections.map((section) => (
          <div key={section.title} className="mb-8">
            <h5 className="text-sm font-semibold text-gray-900 mb-4">
              {section.title}
            </h5>
            <nav className="space-y-1">
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="sidebar-link"
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;