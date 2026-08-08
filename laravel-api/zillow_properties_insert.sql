-- =====================================================================
-- Insert Zillow-style property listings into the `properties` table.
-- Run these in phpMyAdmin (domestic_re DB) or the mysql CLI.
--
-- Required columns (NOT NULL): uuid, slug, title, price,
--   address, city, state, zip   (country defaults to 'US')
-- uuid and slug are auto-filled by the app when using the API, but raw
-- SQL must supply them, so each INSERT generates uuid and a unique slug.
--
-- Use MySQL 8+ (XAMPP ships MariaDB — UUID()/REPLACE work there too).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) SINGLE-PROPERTY TEMPLATE (fill in the parts between the brackets)
-- ---------------------------------------------------------------------
-- INSERT INTO properties (
--     uuid, slug, title, description, status, price, price_type,
--     bedrooms, bathrooms, sqft, year_built, lot_size, parking_spaces,
--     address, city, state, zip, country, neighborhood, county,
--     latitude, longitude, school_district, walkscore,
--     photos, gallery, video_url, virtual_tour_url, floor_plan_url,
--     amenities, nearby_places, tags,
--     featured, premium, open_house_date, open_house_end,
--     listed_by_type, approval_status
-- ) VALUES (
--     REPLACE(UUID(),'-',''),
--     'my-property-slug-abc12',           -- slug MUST be globally unique
--     '265-04 79th Avenue, Glen Oaks, NY 11004',
--     'Property description text here.',
--     'active',                           -- draft|active|pending|sold|expired|withdrawn
--     1888000.00,                         -- numeric, no $ or commas
--     'sale',                             -- sale|rent|lease
--     3, 4.0, 2314,
--     NULL, NULL, NULL,                   -- year_built, lot_size, parking_spaces
--     '265-04 79th Avenue', 'Glen Oaks', 'NY', '11004', 'US',
--     'Glen Oaks', 'Queens',
--     40.7440000, -73.7160000,            -- latitude, longitude (10,7)
--     NULL, NULL,                         -- school_district, walkscore
--     '["https://photos.zillowstatic.com/fp/8f2462e69fc9b733e5a04fb67662ae27-p_e.webp","https://photos.zillowstatic.com/fp/0f7824520bf381df441aa54d1e9c61e8-p_e.webp"]',
--     NULL,                               -- gallery (JSON array of full-size)
--     NULL, NULL, NULL,                   -- video_url, virtual_tour_url, floor_plan_url
--     '["Garage","Central Air"]',         -- amenities (JSON array)
--     NULL, NULL,                         -- nearby_places, tags (JSON)
--     0, 0,                               -- featured, premium (0/1)
--     NULL, NULL,                         -- open_house_date, open_house_end (Y-m-d H:i:s)
--     'agent',                            -- agent|broker|owner|system
--     'approved'                          -- draft|pending|approved|rejected
-- );

-- ---------------------------------------------------------------------
-- 2) MASS INSERT — all the listings from the pasted Zillow search
--    (adds every row in ONE statement)
--    photo URLs shortened with the full https://photos.zillowstatic.com/ prefix
-- ---------------------------------------------------------------------
INSERT INTO properties (
    uuid, slug, title, description, status, price, price_type,
    bedrooms, bathrooms, sqft,
    address, city, state, zip, country,
    latitude, longitude,
    photos, tags,
    featured, premium, listed_by_type, approval_status
) VALUES
(
    REPLACE(UUID(),'-',''), '265-04-79th-ave-glen-oaks-ny', '265-04 79th Avenue, Glen Oaks, NY 11004',
    '3 bed / 4 bath home in Glen Oaks. Listing by BERKSHIRE HATHAWAY.',
    'active', 1888000.00, 'sale',
    3, 4.0, 2314,
    '265-04 79th Avenue', 'Glen Oaks', 'NY', '11004', 'US',
    40.7440000, -73.7160000,
    '["https://photos.zillowstatic.com/fp/8f2462e69fc9b733e5a04fb67662ae27-p_e.webp","https://photos.zillowstatic.com/fp/0f7824520bf381df441aa54d1e9c61e8-p_e.webp","https://photos.zillowstatic.com/fp/918f93aeafe16c0e7a8625157e685bb7-p_e.webp"]',
    '["House for sale"]',
    0, 0, 'agent', 'approved'
),
(
    REPLACE(UUID(),'-',''), '17212-65th-ave-fresh-meadows-ny', '17212 65th Ave, Fresh Meadows, NY 11365',
    '4 bed / 4 bath home in Fresh Meadows. Listing by KELLER WILLIAMS REALTY GOLD COAST. Open Sun 2-4pm (8/9).',
    'active', 1999000.00, 'sale',
    4, 4.0, 2115,
    '17212 65th Ave', 'Fresh Meadows', 'NY', '11365', 'US',
    40.7364920, -73.7972950,
    '["https://photos.zillowstatic.com/fp/8c6bddb91e3d7e7ef07a67ce37a7f348-p_e.webp","https://photos.zillowstatic.com/fp/fe627eb51fba2f64722b34a025c9d1ed-p_e.webp","https://photos.zillowstatic.com/fp/a7a48207a12da2fb9ca4f19295fcc7b9-p_e.webp"]',
    '["Active"]',
    0, 0, 'agent', 'approved'
),
(
    REPLACE(UUID(),'-',''), '3340-157th-st-flushing-ny', '3340 157th Street, Flushing, NY 11354',
    '7 bed / 5 bath home in Flushing. Listing by CHASE GLOBAL REALTY CORP.',
    'active', 1890000.00, 'sale',
    7, 5.0, 2365,
    '3340 157th Street', 'Flushing', 'NY', '11354', 'US',
    40.7680000, -73.8100000,
    '["https://photos.zillowstatic.com/fp/ecfe3b0cba55100966672599cf693d6d-p_e.webp","https://photos.zillowstatic.com/fp/ae79729fe1bf3a16d7ecb9445e98f48b-p_e.webp","https://photos.zillowstatic.com/fp/0cac21b8bf9dcd27877c8ddaac4d9d6f-p_e.webp"]',
    '["House for sale"]',
    0, 0, 'agent', 'approved'
),
(
    REPLACE(UUID(),'-',''), '10967-203rd-st-saint-albans-ny', '10967 203rd St, Saint Albans, NY 11412',
    '5 bed / 2 bath home in Saint Albans. Listing by JOSHUAS REALTY.',
    'active', 350000.00, 'sale',
    5, 2.0, 1549,
    '10967 203rd St', 'Saint Albans', 'NY', '11412', 'US',
    40.7061348, -73.7541885,
    '["https://maps.googleapis.com/maps/api/streetview?size=575x242&location=40.70613479614258,-73.75418853759766&source=outdoor"]',
    '["House for sale"]',
    0, 0, 'agent', 'approved'
),
(
    REPLACE(UUID(),'-',''), '544-falcon-ave-staten-island-ny', '544 Falcon Ave, Staten Island, NY 10306',
    '5 bed / 7 bath home in Staten Island. Listing by TIGER REALTY. Open Sat 2-3pm (8/8).',
    'active', 1900000.00, 'sale',
    5, 7.0, 3712,
    '544 Falcon Ave', 'Staten Island', 'NY', '10306', 'US',
    40.5594900, -74.1171300,
    '["https://photos.zillowstatic.com/fp/514cb1d708f193bd5d9ffcb2d94e22f7-p_e.webp","https://photos.zillowstatic.com/fp/7da31acc9e5ccb7d9cc3d4eef01ecc14-p_e.webp","https://photos.zillowstatic.com/fp/f21ee09f202b7b71a6dde2e1daab9650-p_e.webp"]',
    '["House for sale"]',
    0, 0, 'agent', 'approved'
),
(
    REPLACE(UUID(),'-',''), '3326-162nd-st-flushing-ny', '3326 162nd St, Flushing, NY 11358',
    '5 bed / 4 bath home in Flushing. Listing by MITRA HAKIMI REALTY GROUP, LLC. Detached garage.',
    'active', 1928000.00, 'sale',
    5, 4.0, 2912,
    '3326 162nd St', 'Flushing', 'NY', '11358', 'US',
    40.7600000, -73.7900000,
    '["https://photos.zillowstatic.com/fp/9e0797700ef8c6c28dc6f7c3f17b8e72-p_e.webp","https://photos.zillowstatic.com/fp/95332ffaa5bdc2c3252de8e6727ad3d3-p_e.webp","https://photos.zillowstatic.com/fp/9e2c381bf147c1fe47eed55bd8eaf830-p_e.webp"]',
    '["Active","Detached garage"]',
    0, 0, 'agent', 'approved'
),
(
    REPLACE(UUID(),'-',''), '1410-e-52nd-st-brooklyn-ny', '1410 E 52nd St, Brooklyn, NY 11234',
    '5 bed / 3 bath home in Brooklyn. Listing by REMAX ELITE. Open Sun 12-2pm (8/9).',
    'active', 769000.00, 'sale',
    5, 3.0, 2039,
    '1410 E 52nd St', 'Brooklyn', 'NY', '11234', 'US',
    40.6251600, -73.9258800,
    '["https://photos.zillowstatic.com/fp/72a4d9642e67591cf83a6d0db1a2e0f7-p_e.webp","https://photos.zillowstatic.com/fp/0422555171955c3b529dbe092d005056-p_e.webp","https://photos.zillowstatic.com/fp/d6c7fe2f14732851cc78cb13f7cf7e1e-p_e.webp"]',
    '["Active"]',
    0, 0, 'agent', 'approved'
),
(
    REPLACE(UUID(),'-',''), '20-dawson-cir-staten-island-ny', '20 Dawson Cir, Staten Island, NY 10314',
    '4 bed / 3 bath home in Staten Island. Listing by COMPASS REALTY CENTRAL INC. Expansive quartz island.',
    'active', 1925000.00, 'sale',
    4, 3.0, 3195,
    '20 Dawson Cir', 'Staten Island', 'NY', '10314', 'US',
    40.6030000, -74.1600000,
    '["https://photos.zillowstatic.com/fp/e507d265cfb65b614c033fe07b54a383-p_e.webp","https://photos.zillowstatic.com/fp/730d0dfb855d4e2b0dc787b6fd9d4e63-p_e.webp","https://photos.zillowstatic.com/fp/73c84d9cfbaca24f4b5278a4bd6428b7-p_e.webp"]',
    '["House for sale"]',
    0, 0, 'agent', 'approved'
),
(
    REPLACE(UUID(),'-',''), '20-church-st-jamaica-ny', '20 Church St, Jamaica, NY 11414',
    '4 bed / 2 bath home in Jamaica. Listing by ISLAND ADVANTAGE REALTY. Waterfront location.',
    'active', 385000.00, 'sale',
    4, 2.0, 2070,
    '20 Church St', 'Jamaica', 'NY', '11414', 'US',
    40.6400000, -73.8400000,
    '["https://photos.zillowstatic.com/fp/e856471841eddf1d54488f72c59dadcf-p_e.webp","https://photos.zillowstatic.com/fp/a97e8f27a78ba6982eef19b9f8b780b5-p_e.webp","https://photos.zillowstatic.com/fp/cf225b2b60c8bfc51ffedde52bb34eef-p_e.webp"]',
    '["Active","Waterfront location"]',
    0, 0, 'agent', 'approved'
);
