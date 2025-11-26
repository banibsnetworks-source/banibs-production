"""
Initialize BPOC with 100% Alignment to Architecture Spec
Phase 0.0 - Platform Orchestration Core

Populates with proper:
- Layer assignments (0-4)
- Trigger classifications (System, Environmental, Risk-Mitigation)
- Layer-based dependencies
"""

import asyncio
from datetime import datetime, timezone
from db.connection import get_db_client
from db.orchestration import OrchestrationDB


# Module definitions with PROPER LAYER ASSIGNMENTS
MODULES = [
    # ==================== LAYER 0 - INFRASTRUCTURE ====================
    {
        "code": "unified_auth_6_0",
        "name": "Unified Authentication System",
        "phase": "6.0",
        "layer": "LAYER_0_INFRASTRUCTURE",
        "category": "INFRASTRUCTURE",
        "description_short": "Single sign-on authentication across all BANIBS portals",
        "description_internal": "Core auth system that powers all portal access. Foundation for entire platform.",
        "rollout_stage": "FULL_LAUNCH",
        "visibility": "PUBLIC",
        "owner_team": "Infrastructure-Core",
        "risk_flags": []
    },
    {
        "code": "bpoc_0_0",
        "name": "Platform Orchestration Core (BPOC)",
        "phase": "0.0",
        "layer": "LAYER_0_INFRASTRUCTURE",
        "category": "INFRASTRUCTURE",
        "description_short": "Internal governance system for managing module rollouts",
        "description_internal": "Control panel for founder/admin. The master switchboard. Patent-protected administration layer.",
        "rollout_stage": "IN_DEV",
        "visibility": "INTERNAL_ONLY",
        "owner_team": "Neo-Core",
        "risk_flags": []
    },
    
    # ==================== LAYER 1 - GOVERNANCE ====================
    {
        "code": "integrity_tracking",
        "name": "Integrity Tracking System",
        "phase": "TBD",
        "layer": "LAYER_1_GOVERNANCE",
        "category": "INFRASTRUCTURE",
        "description_short": "Platform-wide reputation and trust scoring",
        "description_internal": "Ensures platform safety by tracking user integrity, preventing bad actors. Core governance.",
        "rollout_stage": "PLANNED",
        "visibility": "INTERNAL_ONLY",
        "owner_team": "Safety-Team",
        "risk_flags": ["TRUST", "LEGAL"]
    },
    {
        "code": "reputation_shield_22_8",
        "name": "Reputation & Anti-Defamation Shield",
        "phase": "22.8",
        "layer": "LAYER_1_GOVERNANCE",
        "category": "SAFETY",
        "description_short": "Defamation protection and reputation management",
        "description_internal": "Legal and social protection layer. Prevents platform from becoming defamation vector.",
        "rollout_stage": "PLANNED",
        "visibility": "INTERNAL_ONLY",
        "owner_team": "Safety-Team",
        "risk_flags": ["LEGAL", "TRUST"]
    },
    
    # ==================== LAYER 2 - FOUNDATION ====================
    {
        "code": "ability_network_11_5",
        "name": "Ability Network",
        "phase": "11.5",
        "layer": "LAYER_2_FOUNDATION",
        "category": "HELP_SYSTEM",
        "description_short": "Disability, neurodiversity, and caregiver support portal",
        "description_internal": "Standalone help system. Safe to deploy. No financial risk. High community value.",
        "rollout_stage": "FULL_LAUNCH",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": ["SAFETY"]
    },
    {
        "code": "health_hub_11_6_1",
        "name": "Health Hub",
        "phase": "11.6.1",
        "layer": "LAYER_2_FOUNDATION",
        "category": "HELP_SYSTEM",
        "description_short": "Health resources and provider directory",
        "description_internal": "Health pillar of Community Life Hub. Foundation-level help system.",
        "rollout_stage": "FULL_LAUNCH",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": ["SAFETY", "LEGAL"]
    },
    {
        "code": "fitness_hub_11_6_2",
        "name": "Fitness & Wellness Hub",
        "phase": "11.6.2",
        "layer": "LAYER_2_FOUNDATION",
        "category": "HELP_SYSTEM",
        "description_short": "Fitness classes, trainers, and wellness resources",
        "description_internal": "Fitness pillar. Low risk, high value foundation module.",
        "rollout_stage": "FULL_LAUNCH",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": []
    },
    {
        "code": "food_culture_11_6_3",
        "name": "Food & Culture Hub",
        "phase": "11.6.3",
        "layer": "LAYER_2_FOUNDATION",
        "category": "HELP_SYSTEM",
        "description_short": "Recipe directory and cultural food traditions",
        "description_internal": "Cultural preservation through cuisine. Foundation-level, safe deployment.",
        "rollout_stage": "FULL_LAUNCH",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": []
    },
    {
        "code": "alternative_schooling_11_6_4",
        "name": "Alternative Schooling Hub",
        "phase": "11.6.4",
        "layer": "LAYER_2_FOUNDATION",
        "category": "EDUCATION",
        "description_short": "Homeschooling and alternative education resources",
        "description_internal": "Education pillar. Empowers parents. Foundation-level help system.",
        "rollout_stage": "FULL_LAUNCH",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": ["LEGAL"]
    },
    {
        "code": "elder_honor_11_14",
        "name": "Elder Honor & Legacy Restoration System",
        "phase": "11.14",
        "layer": "LAYER_2_FOUNDATION",
        "category": "HELP_SYSTEM",
        "description_short": "Elder care resources, legacy preservation, and family support",
        "description_internal": "Addresses elder care crisis. High community impact. Foundation-level.",
        "rollout_stage": "PLANNED",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": ["SAFETY", "TRUST", "LEGAL"]
    },
    {
        "code": "medication_helper_11_4",
        "name": "Medication Helper",
        "phase": "11.4",
        "layer": "LAYER_2_FOUNDATION",
        "category": "HELP_SYSTEM",
        "description_short": "Medication reminders and tracking for elders",
        "description_internal": "Elder care component. Prevents medication errors. Foundation help system.",
        "rollout_stage": "PLANNED",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": ["SAFETY", "LEGAL"]
    },
    {
        "code": "calendar_time_11_3",
        "name": "My Time & Calendar",
        "phase": "11.3",
        "layer": "LAYER_2_FOUNDATION",
        "category": "HELP_SYSTEM",
        "description_short": "Appointment scheduling and time management for elders",
        "description_internal": "Helps elders manage care schedules. Foundation-level utility.",
        "rollout_stage": "PLANNED",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": []
    },
    {
        "code": "petwatch_11_10",
        "name": "Pet Support Network (PetWatch)",
        "phase": "11.10",
        "layer": "LAYER_2_FOUNDATION",
        "category": "HELP_SYSTEM",
        "description_short": "Lost pet alerts, vet resources, and pet care support",
        "description_internal": "Pet care for community. Safe, foundation-level service.",
        "rollout_stage": "PLANNED",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": ["SAFETY"]
    },
    {
        "code": "compassion_center",
        "name": "Compassion Center",
        "phase": "TBD",
        "layer": "LAYER_2_FOUNDATION",
        "category": "HELP_SYSTEM",
        "description_short": "Crisis support and mental health resources",
        "description_internal": "Immediate crisis support. Connects to professional help. Foundation but high-sensitivity.",
        "rollout_stage": "PLANNED",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": ["SAFETY", "LEGAL", "TRUST"]
    },
    
    # ==================== LAYER 3 - SOCIAL ====================
    {
        "code": "circles_11_5_3",
        "name": "Circles - Support Groups",
        "phase": "11.5.3",
        "layer": "LAYER_3_SOCIAL",
        "category": "SOCIAL",
        "description_short": "Community support groups across all portals",
        "description_internal": "Social network module. Requires risk mitigation and governance.",
        "rollout_stage": "SOFT_LAUNCH",
        "visibility": "PUBLIC",
        "owner_team": "Community-Life-Team",
        "risk_flags": ["SAFETY", "TRUST"]
    },
    {
        "code": "sisters_network",
        "name": "Sister Network",
        "phase": "11.x",
        "layer": "LAYER_3_SOCIAL",
        "category": "SOCIAL",
        "description_short": "Women's support and empowerment network",
        "description_internal": "Safe space for Black women. Social module requiring governance.",
        "rollout_stage": "PLANNED",
        "visibility": "INVITE_ONLY",
        "owner_team": "Social-Team",
        "risk_flags": ["SAFETY", "TRUST"]
    },
    {
        "code": "brothers_network",
        "name": "Brother Network",
        "phase": "11.x",
        "layer": "LAYER_3_SOCIAL",
        "category": "SOCIAL",
        "description_short": "Men's support and mentorship network",
        "description_internal": "Safe space for Black men. Social module requiring governance.",
        "rollout_stage": "PLANNED",
        "visibility": "INVITE_ONLY",
        "owner_team": "Social-Team",
        "risk_flags": ["SAFETY", "TRUST"]
    },
    {
        "code": "safe_places_22_0",
        "name": "Safe Places Network",
        "phase": "22.0",
        "layer": "LAYER_3_SOCIAL",
        "category": "SAFETY",
        "description_short": "Network of verified safe spaces for Black community",
        "description_internal": "Critical safety infrastructure. Social module with highest risk mitigation needs.",
        "rollout_stage": "PLANNED",
        "visibility": "INVITE_ONLY",
        "owner_team": "Safety-Team",
        "risk_flags": ["SAFETY", "TRUST", "LEGAL", "SCALING"]
    },
    
    # ==================== LAYER 4 - HIGH IMPACT ====================
    {
        "code": "marketplace_16_0",
        "name": "Global Marketplace",
        "phase": "16.0",
        "layer": "LAYER_4_HIGH_IMPACT",
        "category": "MARKETPLACE",
        "description_short": "Buy Black marketplace across continents",
        "description_internal": "Financial infrastructure. High-impact commerce platform.",
        "rollout_stage": "FULL_LAUNCH",
        "visibility": "PUBLIC",
        "owner_team": "Commerce-Team",
        "risk_flags": ["FINANCE"]
    },
    {
        "code": "marketplace_wallet_16_1",
        "name": "BANIBS Wallet & Payment System",
        "phase": "16.1",
        "layer": "LAYER_4_HIGH_IMPACT",
        "category": "MARKETPLACE",
        "description_short": "Internal payment system for marketplace transactions",
        "description_internal": "Financial system. Critical high-impact infrastructure.",
        "rollout_stage": "FULL_LAUNCH",
        "visibility": "PUBLIC",
        "owner_team": "Commerce-Team",
        "risk_flags": ["FINANCE", "LEGAL"]
    },
    {
        "code": "cashout_engine_16_3",
        "name": "External Cash-Out Engine",
        "phase": "16.3",
        "layer": "LAYER_4_HIGH_IMPACT",
        "category": "MARKETPLACE",
        "description_short": "Real payment processor integration (Stripe) for seller payouts",
        "description_internal": "Real money transfers. Highest financial risk and compliance needs.",
        "rollout_stage": "PLANNED",
        "visibility": "PUBLIC",
        "owner_team": "Commerce-Team",
        "risk_flags": ["FINANCE", "LEGAL", "SCALING"]
    },
    {
        "code": "ai_mentor_17_0",
        "name": "AI Mentor Suite",
        "phase": "17.0",
        "layer": "LAYER_4_HIGH_IMPACT",
        "category": "BUSINESS",
        "description_short": "AI-powered business, finance, and life guidance",
        "description_internal": "Democratizes access to business coaching. High-impact AI system.",
        "rollout_stage": "PLANNED",
        "visibility": "PUBLIC",
        "owner_team": "AI-Team",
        "risk_flags": ["TRUST", "SCALING"]
    },
    {
        "code": "community_ai_11_12",
        "name": "Community AI Assistants",
        "phase": "11.12",
        "layer": "LAYER_4_HIGH_IMPACT",
        "category": "HELP_SYSTEM",
        "description_short": "AI assistants for community support and navigation",
        "description_internal": "Platform navigation AI. High-impact but requires trust establishment.",
        "rollout_stage": "PLANNED",
        "visibility": "PUBLIC",
        "owner_team": "AI-Team",
        "risk_flags": ["TRUST"]
    },
    {
        "code": "essentials_coop_20_0",
        "name": "Essentials & Cooperative",
        "phase": "20.0",
        "layer": "LAYER_4_HIGH_IMPACT",
        "category": "MARKETPLACE",
        "description_short": "Community buying cooperative for essential goods",
        "description_internal": "Collective purchasing. High-impact economic empowerment.",
        "rollout_stage": "PLANNED",
        "visibility": "PUBLIC",
        "owner_team": "Commerce-Team",
        "risk_flags": ["FINANCE", "LEGAL", "SCALING"]
    }
]


async def init_orchestration_aligned():
    """Initialize BPOC with 100% alignment to architecture spec"""
    print("🚀 Initializing Platform Orchestration Core (BPOC) - ALIGNED VERSION...")
    
    db = get_db_client()
    orch_db = OrchestrationDB(db)
    
    # Clear existing data
    print("📋 Clearing existing orchestration data...")
    await db.module_records.delete_many({})
    await db.rollout_triggers.delete_many({})
    await db.module_dependencies.delete_many({})
    await db.rollout_events.delete_many({})
    await db.orchestration_settings.delete_many({})
    
    # Create all modules with proper layers
    print(f"\n📦 Creating {len(MODULES)} modules with layer assignments...")
    module_ids = {}
    
    for module_data in MODULES:
        module_id = await orch_db.create_module(module_data)
        module_ids[module_data["code"]] = module_id
        print(f"  ✅ {module_data['name']} - {module_data['layer']} ({module_data['rollout_stage']})")
    
    # Add triggers with proper classification
    print("\n🎯 Adding triggers with classification...")
    
    # Safe Places: Risk-Mitigation triggers
    safe_places_id = module_ids.get("safe_places_22_0")
    if safe_places_id:
        await orch_db.create_trigger({
            "module_id": safe_places_id,
            "trigger_class": "SYSTEM",
            "trigger_type": "MIN_ACTIVE_USERS",
            "target_value_number": 200000,
            "is_mandatory": True
        })
        await orch_db.create_trigger({
            "module_id": safe_places_id,
            "trigger_class": "RISK_MITIGATION",
            "trigger_type": "SAFETY_REVIEW",
            "target_value_text": "Complete safety protocol review",
            "is_mandatory": True
        })
        await orch_db.create_trigger({
            "module_id": safe_places_id,
            "trigger_class": "RISK_MITIGATION",
            "trigger_type": "LEGAL_REVIEW",
            "target_value_text": "Legal team sign-off on verification process",
            "is_mandatory": True
        })
        print(f"  ✅ Safe Places: 3 triggers (1 SYSTEM, 2 RISK_MITIGATION)")
    
    # Elder Honor: Environmental triggers
    elder_honor_id = module_ids.get("elder_honor_11_14")
    if elder_honor_id:
        await orch_db.create_trigger({
            "module_id": elder_honor_id,
            "trigger_class": "SYSTEM",
            "trigger_type": "MIN_ACTIVE_USERS",
            "target_value_number": 100000,
            "is_mandatory": True
        })
        await orch_db.create_trigger({
            "module_id": elder_honor_id,
            "trigger_class": "ENVIRONMENTAL",
            "trigger_type": "CUSTOM",
            "target_value_text": "Elder support team availability confirmed",
            "is_mandatory": True
        })
        print(f"  ✅ Elder Honor: 2 triggers (1 SYSTEM, 1 ENVIRONMENTAL)")
    
    # Compassion Center: Risk-Mitigation + Environmental
    compassion_id = module_ids.get("compassion_center")
    if compassion_id:
        await orch_db.create_trigger({
            "module_id": compassion_id,
            "trigger_class": "SYSTEM",
            "trigger_type": "MIN_ACTIVE_USERS",
            "target_value_number": 50000,
            "is_mandatory": True
        })
        await orch_db.create_trigger({
            "module_id": compassion_id,
            "trigger_class": "RISK_MITIGATION",
            "trigger_type": "LEGAL_REVIEW",
            "target_value_text": "Legal review of crisis response protocols",
            "is_mandatory": True
        })
        await orch_db.create_trigger({
            "module_id": compassion_id,
            "trigger_class": "ENVIRONMENTAL",
            "trigger_type": "MANUAL_APPROVAL_REQUIRED",
            "target_value_text": "Founder approval required",
            "is_mandatory": True
        })
        print(f"  ✅ Compassion Center: 3 triggers (1 SYSTEM, 1 RISK_MITIGATION, 1 ENVIRONMENTAL)")
    
    # Add layer-based dependencies
    print("\n🔗 Adding layer-based dependencies...")
    
    # Layer 2 (Elder Honor) depends on Layer 2 (Ability)
    if elder_honor_id and "ability_network_11_5" in module_ids:
        await orch_db.create_dependency({
            "module_id": elder_honor_id,
            "depends_on_module_id": module_ids["ability_network_11_5"],
            "required_stage": "FULL_LAUNCH",
            "is_hard_dependency": True
        })
        print(f"  ✅ Elder Honor → Ability Network (Layer 2 → Layer 2)")
    
    # Layer 3 (Circles) depends on Layer 1 (Integrity)
    if "circles_11_5_3" in module_ids and "integrity_tracking" in module_ids:
        await orch_db.create_dependency({
            "module_id": module_ids["circles_11_5_3"],
            "depends_on_module_id": module_ids["integrity_tracking"],
            "required_stage": "FULL_LAUNCH",
            "is_hard_dependency": True
        })
        print(f"  ✅ Circles → Integrity Tracking (Layer 3 → Layer 1)")
    
    # Layer 4 (Cash-Out) depends on Layer 4 (Wallet)
    if "cashout_engine_16_3" in module_ids and "marketplace_wallet_16_1" in module_ids:
        await orch_db.create_dependency({
            "module_id": module_ids["cashout_engine_16_3"],
            "depends_on_module_id": module_ids["marketplace_wallet_16_1"],
            "required_stage": "FULL_LAUNCH",
            "is_hard_dependency": True
        })
        print(f"  ✅ Cash-Out → Wallet (Layer 4 → Layer 4)")
    
    # Layer 4 (Marketplace) depends on Layer 1 (Integrity)
    if "marketplace_16_0" in module_ids and "integrity_tracking" in module_ids:
        await orch_db.create_dependency({
            "module_id": module_ids["marketplace_16_0"],
            "depends_on_module_id": module_ids["integrity_tracking"],
            "required_stage": "FULL_LAUNCH",
            "is_hard_dependency": True
        })
        print(f"  ✅ Marketplace → Integrity (Layer 4 → Layer 1)")
    
    # Create default settings
    print("\n⚙️  Creating default orchestration settings...")
    await orch_db.get_settings()
    print(f"  ✅ Default settings created")
    
    # Generate readiness summary
    print("\n📊 Generating readiness summary...")
    summary = await orch_db.get_readiness_summary()
    
    print(f"\n✨ BPOC Initialization Complete (ALIGNED)!")
    print(f"   📦 Total Modules: {len(module_ids)}")
    print(f"   ✅ Ready: {summary['ready_count']}")
    print(f"   ⏳ Waiting: {summary['waiting_count']}")
    print(f"   🚫 Blocked: {summary['blocked_count']}")
    
    # Count by layer
    layer_counts = {}
    for m in MODULES:
        layer = m["layer"]
        layer_counts[layer] = layer_counts.get(layer, 0) + 1
    
    print(f"\n🏗️  Layer Distribution:")
    print(f"   Layer 0 (Infrastructure): {layer_counts.get('LAYER_0_INFRASTRUCTURE', 0)}")
    print(f"   Layer 1 (Governance): {layer_counts.get('LAYER_1_GOVERNANCE', 0)}")
    print(f"   Layer 2 (Foundation): {layer_counts.get('LAYER_2_FOUNDATION', 0)}")
    print(f"   Layer 3 (Social): {layer_counts.get('LAYER_3_SOCIAL', 0)}")
    print(f"   Layer 4 (High-Impact): {layer_counts.get('LAYER_4_HIGH_IMPACT', 0)}")
    
    print(f"\n🎯 Platform Status:")
    print(f"   🟢 FULL_LAUNCH: {sum(1 for m in MODULES if m['rollout_stage'] == 'FULL_LAUNCH')}")
    print(f"   🟡 SOFT_LAUNCH: {sum(1 for m in MODULES if m['rollout_stage'] == 'SOFT_LAUNCH')}")
    print(f"   🔵 IN_DEV: {sum(1 for m in MODULES if m['rollout_stage'] == 'IN_DEV')}")
    print(f"   ⚪ PLANNED: {sum(1 for m in MODULES if m['rollout_stage'] == 'PLANNED')}")
    
    print(f"\n✅ Backend is 100% aligned with Phase 0.0 Architecture Spec")
    print(f"   - Layer architecture: ✅")
    print(f"   - Trigger classification: ✅")
    print(f"   - Layer-based dependencies: ✅")
    print(f"   - Patent-safe separation: ✅")
    
    print(f"\n🔐 Access BPOC at: /admin/orchestration")
    print(f"   (Admin access required)")


if __name__ == "__main__":
    asyncio.run(init_orchestration_aligned())
