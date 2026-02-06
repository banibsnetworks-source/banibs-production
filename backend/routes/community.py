"""
BANIBS Community Life Hub - API Routes
Phase 11.6-11.9

Base path: /api/community/*
"""

from fastapi import APIRouter, Query, HTTPException, Depends, Request
from typing import Optional, List
from uuid import uuid4
from datetime import datetime, timezone

from models.community import (
    HealthResourcesResponse,
    HealthProvidersResponse,
    FitnessProgramsResponse,
    RecipesResponse,
    SchoolResourcesResponse,
    CommunityProsResponse,
    HealthResource,
    HealthProvider,
    FitnessProgram,
    Recipe,
    SchoolResource,
    CommunityPro
)
from db.community import CommunityDB
from db.connection import get_db_client
from middleware.auth_guard import get_current_user as get_current_user_dependency


router = APIRouter(prefix="/api/community", tags=["Community Life Hub"])


# ==================== SHARED ENDPOINTS ====================

@router.get("/pros", response_model=CommunityProsResponse)
async def get_community_pros(
    pillar: Optional[str] = None,
    role: Optional[str] = None,
    region: Optional[str] = None,
    verified_only: bool = False
):
    """Get community professionals across all pillars"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    pros = await community_db.get_all_pros(
        pillar=pillar,
        role=role,
        region=region,
        verified_only=verified_only
    )
    
    return {
        "pros": pros,
        "total": len(pros)
    }


# ==================== HEALTH & INSURANCE ENDPOINTS ====================

@router.get("/health/resources", response_model=HealthResourcesResponse)
async def get_health_resources(
    category: Optional[str] = None,
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    limit: int = Query(50, le=100)
):
    """Get health education resources"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    tags_list = tags.split(",") if tags else None
    
    resources = await community_db.get_health_resources(
        category=category,
        tags=tags_list,
        limit=limit
    )
    
    return {
        "resources": resources,
        "total": len(resources)
    }


@router.get("/health/resources/{slug}", response_model=HealthResource)
async def get_health_resource(slug: str):
    """Get a specific health resource by slug"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    resource = await community_db.get_health_resource_by_slug(slug)
    
    if not resource:
        raise HTTPException(status_code=404, detail="Health resource not found")
    
    return resource


@router.get("/health/providers", response_model=HealthProvidersResponse)
async def get_health_providers(
    type: Optional[str] = None,
    service_types: Optional[str] = Query(None, description="Comma-separated service types"),
    region: Optional[str] = None,
    city: Optional[str] = None,
    telehealth: Optional[bool] = None,
    black_owned: Optional[bool] = None,
    accepts_uninsured: Optional[bool] = None,
    sliding_scale: Optional[bool] = None,
    ability_friendly: Optional[bool] = None,
    limit: int = Query(50, le=100)
):
    """Get healthcare providers - Phase 11.6.1 enhanced filters"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    service_types_list = service_types.split(",") if service_types else None
    
    providers = await community_db.get_health_providers(
        type=type,
        service_types=service_types_list,
        region=region,
        city=city,
        telehealth=telehealth,
        black_owned=black_owned,
        accepts_uninsured=accepts_uninsured,
        sliding_scale=sliding_scale,
        ability_friendly=ability_friendly,
        limit=limit
    )
    
    return {
        "providers": providers,
        "total": len(providers)
    }


@router.get("/health/providers/{provider_id}", response_model=HealthProvider)
async def get_health_provider_detail(provider_id: str):
    """Get a specific healthcare provider by ID or slug"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    # Try by ID first, then by slug
    provider = await community_db.get_health_provider_by_id(provider_id)
    if not provider:
        provider = await community_db.get_health_provider_by_slug(provider_id)
    
    if not provider:
        raise HTTPException(status_code=404, detail="Healthcare provider not found")
    
    return provider


# ==================== FITNESS & WELLNESS ENDPOINTS ====================

@router.get("/fitness/programs", response_model=FitnessProgramsResponse)
async def get_fitness_programs(
    level: Optional[str] = None,
    focus: Optional[str] = Query(None, description="Comma-separated focus areas"),
    delivery: Optional[str] = None,
    chronic_friendly: Optional[str] = Query(None, description="Comma-separated conditions"),
    limit: int = Query(50, le=100)
):
    """Get fitness programs and classes"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    focus_list = focus.split(",") if focus else None
    chronic_list = chronic_friendly.split(",") if chronic_friendly else None
    
    programs = await community_db.get_fitness_programs(
        level=level,
        focus=focus_list,
        delivery=delivery,
        chronic_friendly=chronic_list,
        limit=limit
    )
    
    return {
        "programs": programs,
        "total": len(programs)
    }


@router.get("/fitness/programs/{program_id}", response_model=FitnessProgram)
async def get_fitness_program(program_id: str):
    """Get a specific fitness program by ID or slug"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    # Try by ID first, then by slug
    program = await community_db.get_fitness_program_by_id(program_id)
    if not program:
        program = await community_db.get_fitness_program_by_slug(program_id)
    
    if not program:
        raise HTTPException(status_code=404, detail="Fitness program not found")
    
    return program


@router.get("/fitness/coaches", response_model=CommunityProsResponse)
async def get_fitness_coaches(
    region: Optional[str] = None,
    specialization: Optional[str] = None,
    online_only: Optional[bool] = None
):
    """Get fitness coaches and trainers - Phase 11.6.2"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    coaches = await community_db.get_fitness_coaches(
        region=region,
        specialization=specialization,
        online_only=online_only
    )
    
    return {
        "pros": coaches,
        "total": len(coaches)
    }


@router.get("/fitness/coaches/{coach_id}", response_model=CommunityPro)
async def get_fitness_coach_detail(coach_id: str):
    """Get a specific fitness coach detail"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    # Get coach from pros collection
    coach = await community_db.pros.find_one({"id": coach_id}, {"_id": 0})
    
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    
    return coach


@router.post("/fitness/programs/{program_id}/enroll")
async def enroll_in_program(
    program_id: str, 
    request: Request,
    current_user: dict = Depends(get_current_user_dependency)
):
    """Enroll in a fitness program - Phase 11.6.2 (P1)"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    # Verify program exists
    program = await community_db.fitness_programs.find_one(
        {"$or": [{"id": program_id}, {"slug": program_id}]}, 
        {"_id": 0}
    )
    
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    # Check if already enrolled
    existing = await community_db.program_enrollments.find_one({
        "user_id": current_user["id"],
        "program_id": program["id"]
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this program")
    
    # Create enrollment record
    enrollment = {
        "id": f"enroll-{uuid4().hex[:8]}",
        "program_id": program["id"],
        "user_id": current_user["id"],
        "user_name": current_user.get("name", ""),
        "user_email": current_user.get("email", ""),
        "status": "enrolled",
        "enrolled_at": datetime.now(timezone.utc),
        "progress": 0,
        "notes": None
    }
    
    await community_db.program_enrollments.insert_one(enrollment)
    
    # Increment participant count on program
    await community_db.fitness_programs.update_one(
        {"id": program["id"]},
        {"$inc": {"participants_count": 1}}
    )
    
    return {
        "success": True,
        "message": "Successfully enrolled in program",
        "enrollment_id": enrollment["id"]
    }


# ==================== FOOD & CULTURE ENDPOINTS ====================

@router.get("/food/recipes", response_model=RecipesResponse)
async def get_recipes(
    category: Optional[str] = None,
    origin_region: Optional[str] = None,
    difficulty: Optional[str] = None,
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    limit: int = Query(50, le=100)
):
    """Get culinary recipes"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    tags_list = tags.split(",") if tags else None
    
    recipes = await community_db.get_recipes(
        category=category,
        origin_region=origin_region,
        difficulty=difficulty,
        tags=tags_list,
        approved_only=True,
        limit=limit
    )
    
    return {
        "recipes": recipes,
        "total": len(recipes)
    }


@router.get("/food/recipes/{slug}", response_model=Recipe)
async def get_recipe(slug: str):
    """Get a specific recipe by slug"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    recipe = await community_db.get_recipe_by_slug(slug)
    
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return recipe


@router.post("/food/recipes/submit")
async def submit_recipe(
    recipe_data: dict,
    current_user: dict = Depends(get_current_user_dependency)
):
    """Submit a recipe for review - Phase 11.6.3"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    # Create slug from title
    slug = recipe_data["title"].lower().replace(" ", "-").replace("'", "")
    
    # Create recipe record with pending_review status
    recipe = {
        "id": f"recipe-{uuid4().hex[:8]}",
        "title": recipe_data["title"],
        "slug": slug,
        "origin_region": recipe_data["origin_region"],
        "category": recipe_data["category"],
        "difficulty": recipe_data.get("difficulty", "moderate"),
        "traditional_instructions_md": recipe_data["traditional_instructions_md"],
        "healthier_version_md": recipe_data.get("healthier_version_md"),
        "ingredients_traditional": recipe_data.get("ingredients_traditional", []),
        "ingredients_healthier": recipe_data.get("ingredients_healthier"),
        "cook_time_minutes": recipe_data["cook_time_minutes"],
        "prep_time_minutes": recipe_data.get("prep_time_minutes"),
        "servings": recipe_data.get("servings"),
        "nutrition_level": recipe_data.get("nutrition_level", "medium"),
        "dietary_notes": recipe_data.get("dietary_notes", []),
        "is_family_submitted": True,
        "submitted_by_user_id": current_user["id"],
        "submitted_by_name": current_user.get("name", current_user.get("email", "Unknown")),
        "chef_id": None,
        "image_url": recipe_data.get("image_url"),
        "video_url": None,
        "tags": recipe_data.get("tags", []),
        "is_featured": False,
        "is_approved": False,  # Pending review
        "view_count": 0,
        "saved_count": 0,
        "rating": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await community_db.recipes.insert_one(recipe)
    
    return {
        "success": True,
        "message": "Recipe submitted successfully and is pending review",
        "recipe_id": recipe["id"]
    }


# ==================== ALTERNATIVE SCHOOLING ENDPOINTS ====================

@router.get("/school/resources", response_model=SchoolResourcesResponse)
async def get_school_resources(
    type: Optional[str] = None,
    subject: Optional[str] = Query(None, description="Comma-separated subjects"),
    age_range: Optional[str] = None,
    format: Optional[str] = None,
    cost_range: Optional[str] = None,
    verified_only: bool = False,
    limit: int = Query(50, le=100)
):
    """Get alternative schooling resources"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    subject_list = subject.split(",") if subject else None
    
    resources = await community_db.get_school_resources(
        type=type,
        subject=subject_list,
        age_range=age_range,
        format=format,
        cost_range=cost_range,
        verified_only=verified_only,
        limit=limit
    )
    
    return {
        "resources": resources,
        "total": len(resources)
    }


@router.get("/school/resources/{slug}", response_model=SchoolResource)
async def get_school_resource(slug: str):
    """Get a specific school resource by slug"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    resource = await community_db.get_school_resource_by_slug(slug)
    
    if not resource:
        raise HTTPException(status_code=404, detail="School resource not found")
    
    return resource


@router.post("/school/resources/submit")
async def submit_school_resource(
    resource_data: dict,
    current_user: dict = Depends(get_current_user_dependency)
):
    """Submit a school resource for review - Phase 11.6.4"""
    db = get_db_client()
    community_db = CommunityDB(db)
    
    # Create slug from title
    slug = resource_data["title"].lower().replace(" ", "-").replace("'", "")
    
    # Create resource record with pending_review status
    resource = {
        "id": f"school-{uuid4().hex[:8]}",
        "title": resource_data["title"],
        "slug": slug,
        "type": resource_data["type"],
        "subject": resource_data.get("subject", []),
        "age_range": resource_data["age_range"],
        "format": resource_data["format"],
        "description": resource_data["description"],
        "region": resource_data.get("region"),
        "provider_name": resource_data["provider_name"],
        "contact_website": resource_data.get("contact_website"),
        "contact_email": resource_data.get("contact_email"),
        "contact_phone": resource_data.get("contact_phone"),
        "cost_range": resource_data.get("cost_range", "free"),
        "is_accredited": resource_data.get("is_accredited", False),
        "is_user_submitted": True,
        "submitted_by_user_id": current_user["id"],
        "submitted_by_name": current_user.get("name", current_user.get("email", "Unknown")),
        "is_approved": False,  # Pending review
        "grade_levels": resource_data.get("grade_levels", []),
        "learning_style": resource_data.get("learning_style", []),
        "tags": resource_data.get("tags", []),
        "is_verified": False,
        "is_featured": False,
        "rating": None,
        "total_reviews": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await community_db.school_resources.insert_one(resource)
    
    return {
        "success": True,
        "message": "Resource submitted successfully and is pending review",
        "resource_id": resource["id"]
    }


# ==================== PHASE-0 CONTENT SEEDING ====================

@router.post("/admin/seed/food")
async def seed_food_content(
    current_user: dict = Depends(get_current_user_dependency)
):
    """
    Seed Food & Culture hub with Phase-0 starter content.
    Admin-only, idempotent.
    """
    if current_user.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_db_client()
    community_db = CommunityDB(db)
    
    seed_recipes = [
        {
            "id": "recipe-seed-001",
            "title": "Sunday Baked Chicken (Family-Style)",
            "slug": "sunday-baked-chicken-family-style",
            "origin_region": "Deep South",
            "category": "Main Dish",
            "difficulty": "moderate",
            "cultural_note": "Sunday dinner traditions hold a sacred place in Black American households—a time when families gather, often after church, to share a meal that carries both spiritual and cultural weight.",
            "traditional_instructions_md": """## Sunday Baked Chicken

A staple of the Black American Sunday dinner tradition. This recipe has been passed down through generations, with each family adding their own signature touches.

### Ingredients
- 1 whole chicken (4-5 lbs), cut into pieces
- 2 tbsp olive oil or butter
- 1 tbsp paprika
- 1 tsp garlic powder
- 1 tsp onion powder
- Salt and black pepper to taste
- Fresh herbs (thyme, rosemary)

### Instructions
1. Preheat oven to 375°F
2. Season chicken generously with all spices
3. Place in roasting pan, drizzle with oil
4. Bake for 1 hour until golden and cooked through
5. Let rest 10 minutes before serving

### The Story
In many families, Sunday chicken represented abundance and celebration. It was often the one day when a whole chicken could be prepared, bringing everyone to the table.""",
            "healthier_version_md": """## Lighter Version
- Remove skin before baking
- Use olive oil spray instead of butter
- Add lemon juice for flavor without sodium
- Serve with roasted vegetables instead of gravy""",
            "ingredients_traditional": ["whole chicken", "butter", "paprika", "garlic powder", "onion powder", "salt", "pepper", "thyme", "rosemary"],
            "cook_time_minutes": 60,
            "prep_time_minutes": 15,
            "servings": "6-8",
            "nutrition_level": "medium",
            "dietary_notes": ["gluten-free"],
            "is_family_submitted": False,
            "is_approved": True,
            "is_featured": True,
            "tags": ["sunday-dinner", "heritage", "family-recipe"]
        },
        {
            "id": "recipe-seed-002",
            "title": "Collard Greens with Smoked Turkey",
            "slug": "collard-greens-smoked-turkey",
            "origin_region": "Deep South",
            "category": "Side Dish",
            "difficulty": "easy",
            "cultural_note": "Collard greens represent resilience and resourcefulness—transforming humble ingredients into something nourishing. The tradition of 'pot likker' (the nutritious cooking liquid) dates back centuries.",
            "traditional_instructions_md": """## Collard Greens with Smoked Turkey

A healthier take on the classic, using smoked turkey instead of ham hocks while maintaining that deep, savory flavor.

### Ingredients
- 2 bunches collard greens, cleaned and chopped
- 1 smoked turkey leg or wing
- 1 large onion, diced
- 4 cloves garlic, minced
- 6 cups chicken broth
- 1 tbsp apple cider vinegar
- Red pepper flakes to taste
- Salt and pepper

### Instructions
1. In large pot, sauté onion until translucent
2. Add garlic, cook 1 minute
3. Add turkey and broth, simmer 30 minutes
4. Add collard greens in batches
5. Cook low and slow for 1-2 hours
6. Season with vinegar, salt, pepper

### Heritage Note
The practice of cooking greens 'low and slow' developed as enslaved people made the most of available ingredients, creating dishes of remarkable depth and nutrition.""",
            "healthier_version_md": """## Heart-Healthy Version
- Use low-sodium broth
- Reduce cooking time to retain more nutrients
- Skip added salt if using smoked meat
- Pot likker is nutrient-rich—don't discard!""",
            "ingredients_traditional": ["collard greens", "smoked turkey", "onion", "garlic", "chicken broth", "apple cider vinegar", "red pepper flakes"],
            "cook_time_minutes": 120,
            "prep_time_minutes": 20,
            "servings": "8-10",
            "nutrition_level": "high",
            "dietary_notes": ["high-fiber", "vitamin-rich"],
            "is_family_submitted": False,
            "is_approved": True,
            "is_featured": True,
            "tags": ["greens", "southern", "nutritious"]
        },
        {
            "id": "recipe-seed-003",
            "title": "Jollof Rice (West African Roots)",
            "slug": "jollof-rice-west-african-roots",
            "origin_region": "West Africa",
            "category": "Main Dish",
            "difficulty": "moderate",
            "cultural_note": "Jollof rice connects Black Americans to West African heritage. This one-pot dish has countless regional variations, and the 'Jollof Wars' between Ghana and Nigeria are a beloved cultural debate.",
            "traditional_instructions_md": """## Jollof Rice

A beloved West African dish that has traveled across the diaspora. The key is in the 'party rice' technique—allowing the bottom to get slightly crispy (known as 'socarrat' or 'kanzo').

### Ingredients
- 2 cups long-grain rice
- 1 can tomato paste
- 4 roma tomatoes, blended
- 1 red bell pepper, blended
- 1 onion, half diced, half blended
- 3 cloves garlic
- 1 tsp ginger
- 1 scotch bonnet (optional, for heat)
- 2 cups chicken stock
- Curry powder, thyme, bay leaves
- Vegetable oil

### Instructions
1. Blend tomatoes, pepper, half onion
2. Fry tomato paste in oil until darkened
3. Add blended mixture, cook down (30 min)
4. Add stock and seasonings
5. Add washed rice, reduce heat
6. Cover tightly, cook until rice is done
7. Let bottom crisp slightly for authentic flavor

### Cultural Connection
Jollof rice is often served at celebrations—weddings, naming ceremonies, and holidays. Each cook's version tells their family's story.""",
            "healthier_version_md": """## Lighter Preparation
- Use brown rice (increase liquid and time)
- Reduce oil by half
- Add mixed vegetables for nutrition
- Use low-sodium broth""",
            "ingredients_traditional": ["long-grain rice", "tomato paste", "roma tomatoes", "red bell pepper", "onion", "garlic", "ginger", "scotch bonnet", "chicken stock", "curry powder", "thyme", "bay leaves"],
            "cook_time_minutes": 60,
            "prep_time_minutes": 20,
            "servings": "6",
            "nutrition_level": "medium",
            "dietary_notes": ["can be vegan"],
            "is_family_submitted": False,
            "is_approved": True,
            "is_featured": True,
            "tags": ["west-african", "diaspora", "celebration"]
        },
        {
            "id": "recipe-seed-004",
            "title": "Sweet Potato Pie (Holiday Tradition)",
            "slug": "sweet-potato-pie-holiday-tradition",
            "origin_region": "Deep South",
            "category": "Dessert",
            "difficulty": "moderate",
            "cultural_note": "Sweet potato pie is distinctly Black American—not to be confused with pumpkin pie. It represents the creativity of making something extraordinary from what was available.",
            "traditional_instructions_md": """## Sweet Potato Pie

A holiday essential in Black American households. The debate between sweet potato pie and pumpkin pie is easily settled—they're entirely different experiences.

### Ingredients
- 2 lbs sweet potatoes
- 1/2 cup butter, softened
- 1 cup sugar
- 1/2 cup milk
- 2 eggs
- 1 tsp vanilla
- 1/2 tsp cinnamon
- 1/2 tsp nutmeg
- 1 unbaked pie crust

### Instructions
1. Boil sweet potatoes until tender, drain
2. Mash while hot, add butter
3. Mix in sugar, milk, eggs, vanilla
4. Add spices, blend until smooth
5. Pour into pie crust
6. Bake at 350°F for 55-60 minutes
7. Cool completely before serving

### Family Memory
Sweet potato pie recipes are often closely guarded family secrets. The exact spice blend and whether to add a touch of bourbon varies by family.""",
            "healthier_version_md": """## Reduced Sugar Version
- Cut sugar to 3/4 cup
- Use coconut milk instead of regular milk
- Try a whole wheat crust
- The natural sweetness of yams needs less added sugar""",
            "ingredients_traditional": ["sweet potatoes", "butter", "sugar", "milk", "eggs", "vanilla", "cinnamon", "nutmeg", "pie crust"],
            "cook_time_minutes": 55,
            "prep_time_minutes": 30,
            "servings": "8 slices",
            "nutrition_level": "indulgent",
            "dietary_notes": ["vegetarian"],
            "is_family_submitted": False,
            "is_approved": True,
            "is_featured": True,
            "tags": ["holiday", "dessert", "tradition"]
        },
        {
            "id": "recipe-seed-005",
            "title": "Cornbread Variations Across Regions",
            "slug": "cornbread-variations-across-regions",
            "origin_region": "Deep South",
            "category": "Side Dish",
            "difficulty": "easy",
            "cultural_note": "The great cornbread debate—sweet or not sweet—divides families and regions. Northern-style tends sweeter; Southern-style is traditionally savory. Both are valid.",
            "traditional_instructions_md": """## Classic Southern Cornbread

The foundation of many meals. True Southern cornbread is made in a cast iron skillet, creating that essential crispy crust.

### Ingredients
- 2 cups yellow cornmeal
- 1/2 cup flour
- 1 tbsp baking powder
- 1 tsp salt
- 1 egg
- 1 1/2 cups buttermilk
- 1/4 cup vegetable oil or bacon drippings

### Instructions
1. Preheat oven to 425°F with cast iron skillet inside
2. Mix dry ingredients
3. Whisk egg, buttermilk, and half the oil
4. Combine wet and dry, don't overmix
5. Add remaining oil to hot skillet, swirl
6. Pour batter into sizzling skillet
7. Bake 20-25 minutes until golden

### Regional Notes
- **Deep South**: No sugar, made with bacon drippings
- **Northern Style**: Sweeter, almost cake-like
- **Caribbean Influence**: May include coconut milk
- **Urban Soul**: Often includes jalapeños or cheese""",
            "healthier_version_md": """## Whole Grain Version
- Use half whole grain cornmeal
- Substitute olive oil for bacon drippings
- Add honey instead of sugar for natural sweetness
- Mix in corn kernels for texture""",
            "ingredients_traditional": ["yellow cornmeal", "flour", "baking powder", "salt", "egg", "buttermilk", "vegetable oil"],
            "cook_time_minutes": 25,
            "prep_time_minutes": 10,
            "servings": "8 pieces",
            "nutrition_level": "medium",
            "dietary_notes": ["vegetarian"],
            "is_family_submitted": False,
            "is_approved": True,
            "is_featured": False,
            "tags": ["bread", "essential", "cast-iron"]
        }
    ]
    
    added_count = 0
    for recipe in seed_recipes:
        existing = await community_db.recipes.find_one({"id": recipe["id"]})
        if not existing:
            recipe["created_at"] = datetime.now(timezone.utc)
            recipe["updated_at"] = datetime.now(timezone.utc)
            recipe["view_count"] = 0
            recipe["saved_count"] = 0
            recipe["rating"] = None
            recipe["chef_id"] = None
            recipe["image_url"] = None
            recipe["video_url"] = None
            await community_db.recipes.insert_one(recipe)
            added_count += 1
    
    return {
        "message": f"Food & Culture hub seeded successfully",
        "recipes_added": added_count,
        "total_seed_recipes": len(seed_recipes)
    }


@router.post("/admin/seed/fitness")
async def seed_fitness_content(
    current_user: dict = Depends(get_current_user_dependency)
):
    """
    Seed Fitness & Movement hub with Phase-0 starter content.
    Admin-only, idempotent.
    """
    if current_user.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_db_client()
    community_db = CommunityDB(db)
    
    seed_programs = [
        {
            "id": "fitness-seed-001",
            "title": "15-Minute Morning Stretch (No Equipment)",
            "slug": "15-minute-morning-stretch",
            "description": "A gentle, accessible stretching routine perfect for starting your day. No equipment needed—just your body and a small space. Suitable for all fitness levels.",
            "who_its_for": "Anyone looking for a low-impact way to begin their morning. Especially good for those new to movement or returning after a break.",
            "level": "beginner",
            "intensity": "low",
            "duration_weeks": None,
            "sessions_per_week": 7,
            "session_length_minutes": 15,
            "time_commitment": "15 minutes daily",
            "safety_note": "Move gently and never push into pain. If you have injuries or chronic conditions, check with your healthcare provider before starting.",
            "focus": ["flexibility", "mobility", "stress-relief"],
            "delivery": "self_paced",
            "equipment_needed": [],
            "chronic_friendly": ["arthritis", "back-pain", "fibromyalgia"],
            "accessibility_notes": "Can be modified for seated practice. Focus on breathing and gentle movement.",
            "is_approved": True,
            "is_featured": True
        },
        {
            "id": "fitness-seed-002",
            "title": "Walking as Daily Movement",
            "slug": "walking-as-daily-movement",
            "description": "Walking is one of the most sustainable forms of exercise. This program helps you build a consistent walking habit, starting wherever you are.",
            "who_its_for": "Anyone seeking low-impact cardiovascular exercise. Perfect for those managing weight, blood pressure, or simply wanting to move more.",
            "level": "beginner",
            "intensity": "low",
            "duration_weeks": 4,
            "sessions_per_week": 5,
            "session_length_minutes": 30,
            "time_commitment": "30 minutes, 5 days per week",
            "safety_note": "Wear supportive footwear. Start slower and build up gradually. Stay hydrated and be mindful of weather conditions.",
            "focus": ["cardiovascular", "endurance", "mental-health"],
            "delivery": "self_paced",
            "equipment_needed": ["supportive-shoes"],
            "chronic_friendly": ["diabetes", "hypertension", "heart-health"],
            "accessibility_notes": "Pace and distance can be adjusted. Consider walking aids if needed.",
            "is_approved": True,
            "is_featured": True
        },
        {
            "id": "fitness-seed-003",
            "title": "Chair Mobility for Seniors",
            "slug": "chair-mobility-seniors",
            "description": "A seated exercise program designed for older adults or anyone with limited mobility. Build strength and flexibility safely from a chair.",
            "who_its_for": "Seniors, those with mobility limitations, or anyone who prefers seated exercise. Also great for office workers.",
            "level": "senior",
            "intensity": "low",
            "duration_weeks": 6,
            "sessions_per_week": 3,
            "session_length_minutes": 20,
            "time_commitment": "20 minutes, 3 days per week",
            "safety_note": "Use a sturdy chair without wheels. Keep movements controlled. Stop if you experience dizziness or pain.",
            "focus": ["mobility", "balance", "strength"],
            "delivery": "self_paced",
            "equipment_needed": ["sturdy-chair"],
            "chronic_friendly": ["arthritis", "limited-mobility", "post-surgery"],
            "accessibility_notes": "Fully accessible for wheelchair users. All exercises can be modified.",
            "is_approved": True,
            "is_featured": True
        },
        {
            "id": "fitness-seed-004",
            "title": "Youth Sports & Community Play",
            "slug": "youth-sports-community-play",
            "description": "Resources for encouraging physical activity in young people through sports and play. Focus on fun, teamwork, and building healthy habits early.",
            "who_its_for": "Parents, guardians, and community leaders looking to engage youth in physical activity. Ages 6-17.",
            "level": "beginner",
            "intensity": "moderate",
            "duration_weeks": None,
            "sessions_per_week": 3,
            "session_length_minutes": 45,
            "time_commitment": "45 minutes, 3 times per week",
            "safety_note": "Adult supervision recommended. Ensure proper warm-up before activities. Stay hydrated and take breaks as needed.",
            "focus": ["coordination", "teamwork", "fun"],
            "delivery": "in_person",
            "equipment_needed": ["varies-by-activity"],
            "chronic_friendly": [],
            "accessibility_notes": "Activities can be adapted for different ability levels. Focus on inclusion.",
            "is_approved": True,
            "is_featured": False
        },
        {
            "id": "fitness-seed-005",
            "title": "Breathing & Reset Routines",
            "slug": "breathing-reset-routines",
            "description": "Simple breathing techniques and mental reset practices. Useful for stress management, anxiety relief, and moments when you need to recenter.",
            "who_its_for": "Anyone dealing with stress, anxiety, or simply wanting tools for mental wellness. No fitness background needed.",
            "level": "beginner",
            "intensity": "low",
            "duration_weeks": None,
            "sessions_per_week": 7,
            "session_length_minutes": 10,
            "time_commitment": "5-10 minutes as needed",
            "safety_note": "If you have respiratory conditions, consult your healthcare provider. Stop if you feel lightheaded.",
            "focus": ["stress-relief", "mental-health", "mindfulness"],
            "delivery": "self_paced",
            "equipment_needed": [],
            "chronic_friendly": ["anxiety", "stress", "insomnia"],
            "accessibility_notes": "Can be practiced anywhere—sitting, standing, or lying down.",
            "is_approved": True,
            "is_featured": True
        }
    ]
    
    added_count = 0
    for program in seed_programs:
        existing = await community_db.fitness_programs.find_one({"id": program["id"]})
        if not existing:
            program["created_at"] = datetime.now(timezone.utc)
            program["updated_at"] = datetime.now(timezone.utc)
            program["participants_count"] = 0
            program["rating"] = None
            program["coach_id"] = None
            program["image_url"] = None
            await community_db.fitness_programs.insert_one(program)
            added_count += 1
    
    return {
        "message": f"Fitness & Movement hub seeded successfully",
        "programs_added": added_count,
        "total_seed_programs": len(seed_programs)
    }


@router.post("/admin/seed/health")
async def seed_health_content(
    current_user: dict = Depends(get_current_user_dependency)
):
    """
    Seed Health & Insurance hub with Phase-0 informational content.
    Admin-only, idempotent. NO medical advice—informational only.
    """
    if current_user.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_db_client()
    community_db = CommunityDB(db)
    
    seed_resources = [
        {
            "id": "health-seed-001",
            "title": "Understanding Health Insurance Terms (Plain Language)",
            "slug": "health-insurance-terms-plain-language",
            "category": "insurance_basics",
            "level": "beginner",
            "summary": "A plain-language guide to common health insurance terms. Understanding these terms helps you make informed decisions about your coverage.",
            "content_md": """## Health Insurance Terms Made Simple

Health insurance can be confusing. Here are key terms explained in plain language.

### Premium
What you pay monthly for your insurance, whether or not you use it. Think of it like a membership fee.

### Deductible
The amount you pay out-of-pocket before insurance starts covering costs. A $1,000 deductible means you pay the first $1,000.

### Copay (Copayment)
A fixed amount you pay for specific services. For example, $25 for a doctor visit.

### Coinsurance
After meeting your deductible, you may share costs with insurance. "80/20 coinsurance" means insurance pays 80%, you pay 20%.

### Out-of-Pocket Maximum
The most you'll pay in a year. After reaching this amount, insurance covers 100%.

### In-Network vs Out-of-Network
- **In-Network**: Providers with agreements with your insurance—usually lower costs
- **Out-of-Network**: Providers without agreements—often higher costs

### HMO vs PPO
- **HMO**: Lower costs, but you need referrals and must use network providers
- **PPO**: More flexibility to see specialists, but higher costs

---
*This is educational information only. For specific questions about your coverage, contact your insurance provider.*""",
            "tags": ["insurance", "basics", "terminology"],
            "is_approved": True,
            "is_featured": True,
            "external_links": [
                {"label": "Healthcare.gov Glossary", "url": "https://www.healthcare.gov/glossary/"}
            ],
            "disclaimer": "This information is for educational purposes only and does not constitute insurance advice. Always verify details with your specific insurance provider."
        },
        {
            "id": "health-seed-002",
            "title": "Primary Care vs Emergency Care",
            "slug": "primary-care-vs-emergency-care",
            "category": "healthcare_navigation",
            "level": "beginner",
            "summary": "Understanding when to use primary care, urgent care, and emergency rooms can save time, money, and ensure appropriate treatment.",
            "content_md": """## Knowing Where to Go for Care

Different health situations call for different types of care. Here's a general guide.

### Primary Care (Your Regular Doctor)
**Best for:**
- Annual checkups and preventive care
- Managing ongoing conditions (diabetes, blood pressure)
- Minor illnesses (colds, infections)
- Vaccinations
- Health questions and advice

*Usually requires an appointment. Lowest cost option.*

### Urgent Care
**Best for:**
- Issues that need same-day attention but aren't emergencies
- Minor injuries (sprains, minor cuts)
- Flu symptoms, ear infections
- UTIs
- When your primary doctor isn't available

*Walk-in or same-day appointments. Mid-range cost.*

### Emergency Room (ER)
**Best for:**
- Life-threatening situations
- Severe chest pain or difficulty breathing
- Signs of stroke (face drooping, arm weakness, speech difficulty)
- Severe injuries, broken bones
- Heavy bleeding that won't stop

*Available 24/7. Highest cost—use for true emergencies.*

### When In Doubt
Call your primary care provider's nurse line or use telehealth for guidance on where to go.

---
*This is general guidance. In any situation where you feel your life may be in danger, call 911 immediately.*""",
            "tags": ["healthcare", "navigation", "emergency"],
            "is_approved": True,
            "is_featured": True,
            "external_links": [],
            "disclaimer": "This is general information only. When in doubt about a medical situation, err on the side of caution and seek professional medical advice."
        },
        {
            "id": "health-seed-003",
            "title": "Preventive Screenings by Age Group",
            "slug": "preventive-screenings-by-age",
            "category": "preventive_care",
            "level": "intermediate",
            "summary": "An overview of commonly recommended preventive health screenings. Catching issues early often leads to better outcomes.",
            "content_md": """## Preventive Screenings Overview

Preventive care helps catch health issues early. Here's a general overview of common screenings.

### Adults 18-39
- **Blood Pressure**: At least every 2 years
- **Cholesterol**: Starting at 20, or earlier with risk factors
- **Diabetes**: If overweight or have risk factors
- **STI Screening**: Based on activity and risk
- **Dental**: Every 6-12 months
- **Vision**: Every 2-4 years

### Adults 40-64
All of the above, plus:
- **Mammogram**: Every 1-2 years (discuss with provider)
- **Colon Cancer Screening**: Starting at 45-50
- **Prostate Discussion**: Men should discuss with provider
- **Diabetes**: Every 3 years if normal

### Adults 65+
All of the above, plus:
- **Bone Density**: Women at 65, men with risk factors
- **Hearing**: Regularly
- **Cognitive Screening**: Discuss with provider
- **Shingles Vaccine**: Recommended
- **Pneumonia Vaccine**: Recommended

### Important Notes
- Screening recommendations vary based on personal and family history
- Some communities face higher risks for certain conditions
- Always discuss your specific situation with your healthcare provider

---
*These are general guidelines. Your healthcare provider can recommend screenings based on your individual health profile.*""",
            "tags": ["prevention", "screenings", "wellness"],
            "is_approved": True,
            "is_featured": True,
            "external_links": [
                {"label": "CDC Preventive Care Guidelines", "url": "https://www.cdc.gov/prevention/"}
            ],
            "disclaimer": "Screening recommendations vary by individual. Consult your healthcare provider for personalized recommendations."
        },
        {
            "id": "health-seed-004",
            "title": "Mental Health Resources Overview",
            "slug": "mental-health-resources-overview",
            "category": "mental_health",
            "level": "beginner",
            "summary": "An introduction to mental health support options. Mental health is health—seeking support is a sign of strength.",
            "content_md": """## Mental Health Support Options

Taking care of mental health is just as important as physical health. Here are types of support available.

### Types of Mental Health Professionals

**Psychiatrist**
- Medical doctor specializing in mental health
- Can prescribe medication
- Often works with other providers

**Psychologist**
- Doctoral-level training in psychology
- Provides therapy and testing
- Cannot prescribe in most states

**Licensed Clinical Social Worker (LCSW)**
- Master's level training
- Provides therapy and counseling
- Often helps connect to community resources

**Licensed Professional Counselor (LPC)**
- Master's level training
- Provides therapy and counseling
- Various specializations

### Finding Affordable Care
- **Insurance**: Check your mental health benefits
- **Sliding Scale**: Many providers adjust fees based on income
- **Community Health Centers**: Often offer mental health services
- **Employee Assistance Programs (EAP)**: Free short-term counseling through employers
- **Telehealth**: May be more affordable and accessible

### Crisis Resources
- **988 Suicide & Crisis Lifeline**: Call or text 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911 for immediate danger

### Cultural Considerations
Finding a provider who understands your cultural background can improve care. Many directories allow filtering by cultural competency.

---
*Seeking mental health support is a sign of strength. You don't have to face challenges alone.*""",
            "tags": ["mental-health", "counseling", "support"],
            "is_approved": True,
            "is_featured": True,
            "external_links": [
                {"label": "SAMHSA Treatment Locator", "url": "https://findtreatment.samhsa.gov/"},
                {"label": "Psychology Today Directory", "url": "https://www.psychologytoday.com/us/therapists"}
            ],
            "disclaimer": "This is informational only. If you're in crisis, please contact 988 (Suicide & Crisis Lifeline) or 911 immediately."
        },
        {
            "id": "health-seed-005",
            "title": "Advocating for Yourself in Healthcare Settings",
            "slug": "advocating-yourself-healthcare",
            "category": "patient_advocacy",
            "level": "intermediate",
            "summary": "Practical guidance for communicating with healthcare providers and ensuring your concerns are heard and addressed.",
            "content_md": """## Being Your Own Health Advocate

You have the right to be heard and involved in your healthcare decisions. Here's how to advocate effectively.

### Preparing for Appointments
- **Write down your concerns** beforehand
- **List all medications** including supplements
- **Note your symptoms**: When they started, how often, what helps
- **Bring a support person** if helpful

### During the Appointment
- **Be specific** about your symptoms and concerns
- **Ask questions** if something isn't clear
- **Take notes** or ask to record the conversation
- **Repeat back** what you heard to confirm understanding

### Questions to Ask
- What is this diagnosis/test for?
- What are my treatment options?
- What are the risks and benefits?
- What happens if I don't do this?
- Are there alternatives?

### If You Feel Dismissed
- **Restate your concern**: "I want to make sure you understand..."
- **Ask for documentation**: "Can you note in my chart that I reported this?"
- **Request a second opinion**: This is your right
- **Consider another provider**: You can change doctors

### Know Your Rights
- You have the right to understand your treatment
- You have the right to refuse treatment
- You have the right to access your medical records
- You have the right to privacy

### Bringing a Support Person
Having someone with you can help:
- Remember information
- Ask questions you might forget
- Provide emotional support
- Advocate on your behalf if needed

---
*You are the expert on your own body. Your concerns are valid and deserve attention.*""",
            "tags": ["advocacy", "communication", "patient-rights"],
            "is_approved": True,
            "is_featured": True,
            "external_links": [],
            "disclaimer": "This guidance is for informational purposes. For specific medical or legal questions, consult appropriate professionals."
        }
    ]
    
    added_count = 0
    for resource in seed_resources:
        existing = await community_db.health_resources.find_one({"id": resource["id"]})
        if not existing:
            resource["created_at"] = datetime.now(timezone.utc)
            resource["updated_at"] = datetime.now(timezone.utc)
            resource["view_count"] = 0
            resource["saved_count"] = 0
            resource["author_id"] = None
            resource["author_name"] = "BANIBS Editorial"
            await community_db.health_resources.insert_one(resource)
            added_count += 1
    
    return {
        "message": f"Health & Insurance hub seeded successfully",
        "resources_added": added_count,
        "total_seed_resources": len(seed_resources)
    }


@router.post("/admin/seed/all")
async def seed_all_community_hubs(
    current_user: dict = Depends(get_current_user_dependency)
):
    """
    Seed all community hubs with Phase-0 content in one call.
    Admin-only, idempotent.
    """
    if current_user.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Call individual seed functions
    from fastapi import Request
    
    food_result = await seed_food_content(current_user)
    fitness_result = await seed_fitness_content(current_user)
    health_result = await seed_health_content(current_user)
    
    return {
        "message": "All community hubs seeded successfully",
        "results": {
            "food_culture": food_result,
            "fitness_movement": fitness_result,
            "health_insurance": health_result
        }
    }

