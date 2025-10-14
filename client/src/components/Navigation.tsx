const Navigation = () => {
  const navItems = ["DASHBOARD", "DATASET", "MODEL", "LOGS"];

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wider">
            INTRUSION DETECTION SYSTEM
          </h1>
          <div className="flex gap-8">
            {navItems.map((item) => (
              <button
                key={item}
                className="text-sm font-medium tracking-wide transition-colors hover:text-primary"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
