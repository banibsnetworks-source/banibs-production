/**
 * BANIBS Business Directory Categories
 * Grouped structure with headers and subcategories
 * 
 * Format:
 * - type: 'header' = Bold section header (non-selectable)
 * - type: 'category' = Selectable category (indented with spaces)
 */

export const categoryOptions = [
  { type: 'category', label: 'All Categories', value: '' },
  
  // ========== CORE BLACK BUSINESS ==========
  { type: 'header', label: '━━━ CORE BLACK BUSINESS ━━━' },
  { type: 'category', label: '  Barbers', value: 'Barbers' },
  { type: 'category', label: '  Beauticians / Hair Stylists', value: 'Beauticians / Hair Stylists' },
  { type: 'category', label: '  Braiders', value: 'Braiders' },
  { type: 'category', label: '  Estheticians', value: 'Estheticians' },
  { type: 'category', label: '  Nail Technicians', value: 'Nail Technicians' },
  
  // ========== LIFESTYLE & CULTURE ==========
  { type: 'header', label: '━━━ LIFESTYLE & CULTURE ━━━' },
  { type: 'category', label: '  Black Art / African Art / Caribbean Art', value: 'Black Art / African Art / Caribbean Art' },
  { type: 'category', label: '  Cultural Goods & Crafts', value: 'Cultural Goods & Crafts' },
  { type: 'category', label: '  Custom Clothing / Tailors', value: 'Custom Clothing / Tailors' },
  { type: 'category', label: '  Fashion & Apparel', value: 'Fashion & Apparel' },
  { type: 'category', label: '  Jewelry & Accessories', value: 'Jewelry & Accessories' },
  
  // ========== FOOD & CULINARY ==========
  { type: 'header', label: '━━━ FOOD & CULINARY ━━━' },
  { type: 'category', label: '  African Cuisine', value: 'African Cuisine' },
  { type: 'category', label: '  Bakers / Pastry', value: 'Bakers / Pastry' },
  { type: 'category', label: '  Caribbean Cuisine', value: 'Caribbean Cuisine' },
  { type: 'category', label: '  Catering', value: 'Catering' },
  { type: 'category', label: '  Food Trucks', value: 'Food Trucks' },
  { type: 'category', label: '  Restaurants', value: 'Restaurants' },
  { type: 'category', label: '  Soul Food', value: 'Soul Food' },
  
  // ========== CARPENTRY & WOODWORK ==========
  { type: 'header', label: '━━━ CARPENTRY & WOODWORK ━━━' },
  { type: 'category', label: '  Cabinet Builders / Installers', value: 'Cabinet Builders / Installers' },
  { type: 'category', label: '  Carpenters', value: 'Carpenters' },
  { type: 'category', label: '  Custom Furniture Makers', value: 'Custom Furniture Makers' },
  { type: 'category', label: '  Deck & Patio Builders', value: 'Deck & Patio Builders' },
  { type: 'category', label: '  Furniture Repair Specialists', value: 'Furniture Repair Specialists' },
  { type: 'category', label: '  Trim & Molding Specialists', value: 'Trim & Molding Specialists' },
  { type: 'category', label: '  Woodworkers', value: 'Woodworkers' },
  
  // ========== HANDYMAN & GENERAL REPAIRS ==========
  { type: 'header', label: '━━━ HANDYMAN & GENERAL REPAIRS ━━━' },
  { type: 'category', label: '  General Handyman Services', value: 'General Handyman Services' },
  { type: 'category', label: '  Home Improvement Helpers', value: 'Home Improvement Helpers' },
  { type: 'category', label: '  Home Repair Technicians', value: 'Home Repair Technicians' },
  { type: 'category', label: '  Mobile Handyman Services', value: 'Mobile Handyman Services' },
  { type: 'category', label: '  Odd Jobs / Small Fix-It Services', value: 'Odd Jobs / Small Fix-It Services' },
  { type: 'category', label: '  Property Maintenance Workers', value: 'Property Maintenance Workers' },
  
  // ========== HVAC & ENVIRONMENTAL SYSTEMS ==========
  { type: 'header', label: '━━━ HVAC & ENVIRONMENTAL SYSTEMS ━━━' },
  { type: 'category', label: '  Air Conditioning Repair', value: 'Air Conditioning Repair' },
  { type: 'category', label: '  Duct Cleaning Services', value: 'Duct Cleaning Services' },
  { type: 'category', label: '  Furnace & Boiler Technicians', value: 'Furnace & Boiler Technicians' },
  { type: 'category', label: '  Heating Repair', value: 'Heating Repair' },
  { type: 'category', label: '  HVAC Technicians', value: 'HVAC Technicians' },
  { type: 'category', label: '  Ventilation Specialists', value: 'Ventilation Specialists' },
  
  // ========== ELECTRICAL & POWER ==========
  { type: 'header', label: '━━━ ELECTRICAL & POWER ━━━' },
  { type: 'category', label: '  Electricians', value: 'Electricians' },
  { type: 'category', label: '  Generator Technicians', value: 'Generator Technicians' },
  { type: 'category', label: '  Lighting Installation Technicians', value: 'Lighting Installation Technicians' },
  { type: 'category', label: '  Residential Electrical Repair', value: 'Residential Electrical Repair' },
  
  // ========== PLUMBING & WATER SYSTEMS ==========
  { type: 'header', label: '━━━ PLUMBING & WATER SYSTEMS ━━━' },
  { type: 'category', label: '  Drain Cleaning Services', value: 'Drain Cleaning Services' },
  { type: 'category', label: '  Leak Repair Specialists', value: 'Leak Repair Specialists' },
  { type: 'category', label: '  Pipefitters', value: 'Pipefitters' },
  { type: 'category', label: '  Plumbers', value: 'Plumbers' },
  { type: 'category', label: '  Water Heater Technicians', value: 'Water Heater Technicians' },
  
  // ========== APPLIANCE REPAIR ==========
  { type: 'header', label: '━━━ APPLIANCE REPAIR ━━━' },
  { type: 'category', label: '  Dishwasher Repair', value: 'Dishwasher Repair' },
  { type: 'category', label: '  Refrigerator Repair', value: 'Refrigerator Repair' },
  { type: 'category', label: '  Small Appliance Technicians', value: 'Small Appliance Technicians' },
  { type: 'category', label: '  Stove/Oven Repair', value: 'Stove/Oven Repair' },
  { type: 'category', label: '  Washers & Dryers Repair', value: 'Washers & Dryers Repair' },
  
  // ========== ROOFING & EXTERIOR ==========
  { type: 'header', label: '━━━ ROOFING & EXTERIOR ━━━' },
  { type: 'category', label: '  Brick/Stone Exterior Repair', value: 'Brick/Stone Exterior Repair' },
  { type: 'category', label: '  Chimney Repair', value: 'Chimney Repair' },
  { type: 'category', label: '  Door Installation/Repair', value: 'Door Installation/Repair' },
  { type: 'category', label: '  Door Replacement', value: 'Door Replacement' },
  { type: 'category', label: '  Flat Roof Specialists', value: 'Flat Roof Specialists' },
  { type: 'category', label: '  Full Roof Replacement', value: 'Full Roof Replacement' },
  { type: 'category', label: '  Gutter Cleaning', value: 'Gutter Cleaning' },
  { type: 'category', label: '  Gutter Installation', value: 'Gutter Installation' },
  { type: 'category', label: '  Gutter Installation/Repair', value: 'Gutter Installation/Repair' },
  { type: 'category', label: '  Leak Detection Technicians', value: 'Leak Detection Technicians' },
  { type: 'category', label: '  Metal Roofing Specialists', value: 'Metal Roofing Specialists' },
  { type: 'category', label: '  Roofers', value: 'Roofers' },
  { type: 'category', label: '  Shingle Roofing Specialists', value: 'Shingle Roofing Specialists' },
  { type: 'category', label: '  Siding Installation/Repair', value: 'Siding Installation/Repair' },
  { type: 'category', label: '  Siding Repair & Installation', value: 'Siding Repair & Installation' },
  { type: 'category', label: '  Window Installation/Repair', value: 'Window Installation/Repair' },
  { type: 'category', label: '  Window Replacement', value: 'Window Replacement' },
  
  // ========== MASONRY & CONCRETE ==========
  { type: 'header', label: '━━━ MASONRY & CONCRETE ━━━' },
  { type: 'category', label: '  Bricklayers', value: 'Bricklayers' },
  { type: 'category', label: '  Concrete Installers', value: 'Concrete Installers' },
  { type: 'category', label: '  Driveway Repair Technicians', value: 'Driveway Repair Technicians' },
  { type: 'category', label: '  Masons', value: 'Masons' },
  { type: 'category', label: '  Sidewalk & Patio Concrete Work', value: 'Sidewalk & Patio Concrete Work' },
  { type: 'category', label: '  Stonework Specialists', value: 'Stonework Specialists' },
  
  // ========== FLOORING & SURFACES ==========
  { type: 'header', label: '━━━ FLOORING & SURFACES ━━━' },
  { type: 'category', label: '  Carpet Installers', value: 'Carpet Installers' },
  { type: 'category', label: '  Flooring Installers', value: 'Flooring Installers' },
  { type: 'category', label: '  Hardwood Floor Specialists', value: 'Hardwood Floor Specialists' },
  { type: 'category', label: '  Marble/Granite Installers', value: 'Marble/Granite Installers' },
  { type: 'category', label: '  Tile Installers', value: 'Tile Installers' },
  
  // ========== DRYWALL & INTERIOR ==========
  { type: 'header', label: '━━━ DRYWALL & INTERIOR ━━━' },
  { type: 'category', label: '  Drywall Installers', value: 'Drywall Installers' },
  { type: 'category', label: '  Drywall Patching/Repair Specialists', value: 'Drywall Patching/Repair Specialists' },
  { type: 'category', label: '  Interior Wall Specialists', value: 'Interior Wall Specialists' },
  { type: 'category', label: '  Painters', value: 'Painters' },
  
  // ========== WELDING & METALWORK ==========
  { type: 'header', label: '━━━ WELDING & METALWORK ━━━' },
  { type: 'category', label: '  Custom Ironwork', value: 'Custom Ironwork' },
  { type: 'category', label: '  Gate/Fence Metal Specialists', value: 'Gate/Fence Metal Specialists' },
  { type: 'category', label: '  Metal Fabricators', value: 'Metal Fabricators' },
  { type: 'category', label: '  Welders', value: 'Welders' },
  
  // ========== LANDSCAPING & OUTDOOR ==========
  { type: 'header', label: '━━━ LANDSCAPING & OUTDOOR ━━━' },
  { type: 'category', label: '  Bush & Hedge Trimming', value: 'Bush & Hedge Trimming' },
  { type: 'category', label: '  Deck Building', value: 'Deck Building' },
  { type: 'category', label: '  Deck Repair', value: 'Deck Repair' },
  { type: 'category', label: '  Fence Builders', value: 'Fence Builders' },
  { type: 'category', label: '  Fence Repair Technicians', value: 'Fence Repair Technicians' },
  { type: 'category', label: '  Hardscaping (Patios, Walkways)', value: 'Hardscaping (Patios, Walkways)' },
  { type: 'category', label: '  Irrigation Specialists', value: 'Irrigation Specialists' },
  { type: 'category', label: '  Landscaping', value: 'Landscaping' },
  { type: 'category', label: '  Landscaping Design Services', value: 'Landscaping Design Services' },
  { type: 'category', label: '  Lawn Care Services', value: 'Lawn Care Services' },
  { type: 'category', label: '  Pool Cleaning', value: 'Pool Cleaning' },
  { type: 'category', label: '  Pool Repair & Maintenance', value: 'Pool Repair & Maintenance' },
  { type: 'category', label: '  Seasonal Cleanup Teams', value: 'Seasonal Cleanup Teams' },
  { type: 'category', label: '  Stump Grinding', value: 'Stump Grinding' },
  { type: 'category', label: '  Tree Cutting & Tree Removal', value: 'Tree Cutting & Tree Removal' },
  { type: 'category', label: '  Tree Trimming Services', value: 'Tree Trimming Services' },
  { type: 'category', label: '  Yard Cleanup Crews', value: 'Yard Cleanup Crews' },
  
  // ========== CONSTRUCTION & TRADES ==========
  { type: 'header', label: '━━━ CONSTRUCTION & TRADES ━━━' },
  { type: 'category', label: '  Construction & Trades', value: 'Construction & Trades' },
  { type: 'category', label: '  Construction Workers', value: 'Construction Workers' },
  { type: 'category', label: '  Demolition Services', value: 'Demolition Services' },
  { type: 'category', label: '  General Contractors', value: 'General Contractors' },
  
  // ========== BASEMENT & FOUNDATION ==========
  { type: 'header', label: '━━━ BASEMENT & FOUNDATION ━━━' },
  { type: 'category', label: '  Basement Finishing & Remodeling', value: 'Basement Finishing & Remodeling' },
  { type: 'category', label: '  Basement Waterproofing', value: 'Basement Waterproofing' },
  { type: 'category', label: '  Crawlspace Repair & Encapsulation', value: 'Crawlspace Repair & Encapsulation' },
  { type: 'category', label: '  Foundation Leak Repair', value: 'Foundation Leak Repair' },
  { type: 'category', label: '  Foundation Stabilization Specialists', value: 'Foundation Stabilization Specialists' },
  { type: 'category', label: '  French Drain Installation', value: 'French Drain Installation' },
  { type: 'category', label: '  Moisture & Humidity Control Services', value: 'Moisture & Humidity Control Services' },
  { type: 'category', label: '  Radon Testing & Mitigation', value: 'Radon Testing & Mitigation' },
  { type: 'category', label: '  Sewer Backup Cleanup', value: 'Sewer Backup Cleanup' },
  { type: 'category', label: '  Sump Pump Installation & Repair', value: 'Sump Pump Installation & Repair' },
  { type: 'category', label: '  Yard Drainage Specialists', value: 'Yard Drainage Specialists' },
  
  // ========== ENVIRONMENTAL & HAZARDS ==========
  { type: 'header', label: '━━━ ENVIRONMENTAL & HAZARDS ━━━' },
  { type: 'category', label: '  Asbestos Removal', value: 'Asbestos Removal' },
  { type: 'category', label: '  Asbestos Testing', value: 'Asbestos Testing' },
  { type: 'category', label: '  Biohazard Cleaning', value: 'Biohazard Cleaning' },
  { type: 'category', label: '  Decontamination Services', value: 'Decontamination Services' },
  { type: 'category', label: '  Hazard Cleanup Crews', value: 'Hazard Cleanup Crews' },
  { type: 'category', label: '  Indoor Air Quality Testing', value: 'Indoor Air Quality Testing' },
  { type: 'category', label: '  Industrial Cleaning Services', value: 'Industrial Cleaning Services' },
  { type: 'category', label: '  Lead Paint Testing & Removal', value: 'Lead Paint Testing & Removal' },
  { type: 'category', label: '  Mold & Mildew Remediation', value: 'Mold & Mildew Remediation' },
  { type: 'category', label: '  Mold Inspection', value: 'Mold Inspection' },
  { type: 'category', label: '  Mold Remediation', value: 'Mold Remediation' },
  { type: 'category', label: '  Water Damage Restoration', value: 'Water Damage Restoration' },
  
  // ========== DISASTER & EMERGENCY ==========
  { type: 'header', label: '━━━ DISASTER & EMERGENCY ━━━' },
  { type: 'category', label: '  Disaster Restoration Contractors', value: 'Disaster Restoration Contractors' },
  { type: 'category', label: '  Emergency Board-Up Services', value: 'Emergency Board-Up Services' },
  { type: 'category', label: '  Emergency Home Repair Teams', value: 'Emergency Home Repair Teams' },
  { type: 'category', label: '  Emergency Roof Tarping', value: 'Emergency Roof Tarping' },
  { type: 'category', label: '  Fire Damage Restoration', value: 'Fire Damage Restoration' },
  { type: 'category', label: '  Flood Cleanup Crews', value: 'Flood Cleanup Crews' },
  { type: 'category', label: '  Smoke Odor Removal', value: 'Smoke Odor Removal' },
  { type: 'category', label: '  Storm Damage Repair', value: 'Storm Damage Repair' },
  { type: 'category', label: '  Tree Damage Removal', value: 'Tree Damage Removal' },
  { type: 'category', label: '  Water Extraction Technicians', value: 'Water Extraction Technicians' },
  
  // ========== HEAVY MACHINERY ==========
  { type: 'header', label: '━━━ HEAVY MACHINERY ━━━' },
  { type: 'category', label: '  Asphalt & Road Crew Operators', value: 'Asphalt & Road Crew Operators' },
  { type: 'category', label: '  Backhoe Operators', value: 'Backhoe Operators' },
  { type: 'category', label: '  Bulldozer Operators', value: 'Bulldozer Operators' },
  { type: 'category', label: '  Concrete Pouring Teams', value: 'Concrete Pouring Teams' },
  { type: 'category', label: '  Crane Operators', value: 'Crane Operators' },
  { type: 'category', label: '  Earthmoving Crews', value: 'Earthmoving Crews' },
  { type: 'category', label: '  Equipment Transport & Hauling', value: 'Equipment Transport & Hauling' },
  { type: 'category', label: '  Excavator Operators', value: 'Excavator Operators' },
  { type: 'category', label: '  Forklift Operators', value: 'Forklift Operators' },
  { type: 'category', label: '  Grading & Land Leveling Services', value: 'Grading & Land Leveling Services' },
  { type: 'category', label: '  Site Prep Contractors', value: 'Site Prep Contractors' },
  { type: 'category', label: '  Skid Steer/Bobcat Operators', value: 'Skid Steer/Bobcat Operators' },
  
  // ========== CDL & TRANSPORT ==========
  { type: 'header', label: '━━━ CDL & TRANSPORT ━━━' },
  { type: 'category', label: '  Bus Drivers (Charter, Shuttle, Private)', value: 'Bus Drivers (Charter, Shuttle, Private)' },
  { type: 'category', label: '  CDL Truck Drivers', value: 'CDL Truck Drivers' },
  { type: 'category', label: '  Dump Truck Services', value: 'Dump Truck Services' },
  { type: 'category', label: '  Flatbed Hauling', value: 'Flatbed Hauling' },
  { type: 'category', label: '  Freight & Logistics Carriers', value: 'Freight & Logistics Carriers' },
  { type: 'category', label: '  Hotshot Drivers', value: 'Hotshot Drivers' },
  { type: 'category', label: '  Independent Truck Owners', value: 'Independent Truck Owners' },
  { type: 'category', label: '  Local Delivery Drivers', value: 'Local Delivery Drivers' },
  { type: 'category', label: '  Lowboy/Heavy Equipment Hauling', value: 'Lowboy/Heavy Equipment Hauling' },
  { type: 'category', label: '  Moving Truck Operators', value: 'Moving Truck Operators' },
  { type: 'category', label: '  School Transport Specialists', value: 'School Transport Specialists' },
  { type: 'category', label: '  Senior & Medical Transport', value: 'Senior & Medical Transport' },
  { type: 'category', label: '  Van Transport Services', value: 'Van Transport Services' },
  
  // ========== COMMERCIAL CONTRACTORS ==========
  { type: 'header', label: '━━━ COMMERCIAL CONTRACTORS ━━━' },
  { type: 'category', label: '  Building Maintenance Contractors', value: 'Building Maintenance Contractors' },
  { type: 'category', label: '  Commercial Construction Crews', value: 'Commercial Construction Crews' },
  { type: 'category', label: '  Commercial Electricians', value: 'Commercial Electricians' },
  { type: 'category', label: '  Commercial Plumbers', value: 'Commercial Plumbers' },
  { type: 'category', label: '  Concrete & Foundation Contractors', value: 'Concrete & Foundation Contractors' },
  { type: 'category', label: '  Demolition Crews', value: 'Demolition Crews' },
  { type: 'category', label: '  Framing Specialists', value: 'Framing Specialists' },
  { type: 'category', label: '  Home Builders (Small & Large Scale)', value: 'Home Builders (Small & Large Scale)' },
  { type: 'category', label: '  Industrial Renovation Teams', value: 'Industrial Renovation Teams' },
  { type: 'category', label: '  Multi-family Housing Repair Teams', value: 'Multi-family Housing Repair Teams' },
  { type: 'category', label: '  Remodeling & Renovation Contractors', value: 'Remodeling & Renovation Contractors' },
  { type: 'category', label: '  Roofing Crews', value: 'Roofing Crews' },
  { type: 'category', label: '  Siding Crews', value: 'Siding Crews' },
  
  // ========== SPECIALTY SERVICES ==========
  { type: 'header', label: '━━━ SPECIALTY SERVICES ━━━' },
  { type: 'category', label: '  Garage Door Repair', value: 'Garage Door Repair' },
  { type: 'category', label: '  Gate Repair / Iron Gate Specialists', value: 'Gate Repair / Iron Gate Specialists' },
  { type: 'category', label: '  Home Security Installers', value: 'Home Security Installers' },
  { type: 'category', label: '  Pest Control Services', value: 'Pest Control Services' },
  { type: 'category', label: '  Smart Home Installation', value: 'Smart Home Installation' },
  { type: 'category', label: '  Surveillance Camera Installers', value: 'Surveillance Camera Installers' },
  { type: 'category', label: '  Termite Specialists', value: 'Termite Specialists' },
  { type: 'category', label: '  Water Damage Specialists', value: 'Water Damage Specialists' },
  
  // ========== PROFESSIONAL SERVICES ==========
  { type: 'header', label: '━━━ PROFESSIONAL SERVICES ━━━' },
  { type: 'category', label: '  Cleaning & Home Care', value: 'Cleaning & Home Care' },
  { type: 'category', label: '  Event Planners', value: 'Event Planners' },
  { type: 'category', label: '  Mechanics', value: 'Mechanics' },
  { type: 'category', label: '  Moving Services', value: 'Moving Services' },
  { type: 'category', label: '  Photographers / Videographers', value: 'Photographers / Videographers' },
  
  // ========== HEALTH & WELLNESS ==========
  { type: 'header', label: '━━━ HEALTH & WELLNESS ━━━' },
  { type: 'category', label: '  Herbalists', value: 'Herbalists' },
  { type: 'category', label: '  Massage Therapy', value: 'Massage Therapy' },
  { type: 'category', label: '  Mental Health Counselors', value: 'Mental Health Counselors' },
  { type: 'category', label: '  Midwives / Doulas', value: 'Midwives / Doulas' },
  { type: 'category', label: '  Trainers', value: 'Trainers' },
  
  // ========== TECH & DIGITAL ==========
  { type: 'header', label: '━━━ TECH & DIGITAL ━━━' },
  { type: 'category', label: '  Developers', value: 'Developers' },
  { type: 'category', label: '  Digital Marketers', value: 'Digital Marketers' },
  { type: 'category', label: '  Graphic Designers', value: 'Graphic Designers' },
  { type: 'category', label: '  Music Producers', value: 'Music Producers' },
  { type: 'category', label: '  Web Designers', value: 'Web Designers' },
  
  // ========== BUSINESS & FINANCE ==========
  { type: 'header', label: '━━━ BUSINESS & FINANCE ━━━' },
  { type: 'category', label: '  Bookkeepers', value: 'Bookkeepers' },
  { type: 'category', label: '  Consultants', value: 'Consultants' },
  { type: 'category', label: '  Insurance Agents', value: 'Insurance Agents' },
  { type: 'category', label: '  Loan Officers', value: 'Loan Officers' },
  { type: 'category', label: '  Tax Preparers', value: 'Tax Preparers' },
  
  // ========== TRAVEL & TRANSPORTATION ==========
  { type: 'header', label: '━━━ TRAVEL & TRANSPORTATION ━━━' },
  { type: 'category', label: '  Car Rental Services', value: 'Car Rental Services' },
  { type: 'category', label: '  Chauffeurs / Drivers', value: 'Chauffeurs / Drivers' },
  { type: 'category', label: '  Travel Agents', value: 'Travel Agents' },
  
  // ========== REAL ESTATE & HOME ==========
  { type: 'header', label: '━━━ REAL ESTATE & HOME ━━━' },
  { type: 'category', label: '  Airbnb Hosts', value: 'Airbnb Hosts' },
  { type: 'category', label: '  Property Managers', value: 'Property Managers' },
  { type: 'category', label: '  Realtors', value: 'Realtors' },
];

// Legacy flat array for backward compatibility
export const categories = categoryOptions
  .filter(opt => opt.type === 'category')
  .map(opt => opt.value || opt.label.trim());
