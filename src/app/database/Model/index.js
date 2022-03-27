export const user = {
    user_id: 'String',
    email: 'String',
    first_name: 'String',
    last_name: 'String',
    photo_url: 'String',
    birth: 'String',
    phone_number: 'String',
    city: 'String',
    location_state: 'String', // reversed key
    country: 'String',
    address: 'String',
    user_role: 'String',
    show_club_name: 'Object',
    short_bio: 'String',
    job: 'String',
    company: 'String',
    industry: 'String',
    verified: 'Boolean',
    approved: 'Boolean',
    loggedin: 'Boolean',
    web_site: 'String',
    twitter_url: 'String',
    linkedin_url: 'String',
    likes_gained: 'Number',
    created_at: 'Date',
    sort_type: 'String',
};

export const manager = {
    user_id: 'String',
    email: 'String',
    first_name: 'String',
    last_name: 'String',
    photo_url: 'String',
    birth: 'String',
    phone_number: 'String',
    city: 'String',
    location_state: 'String', // reversed key
    country: 'String',
    address: 'String',
    user_role: 'String',
    show_club_name: 'String',
    short_bio: 'String',
    job: 'String',
    company: 'String',
    industry: 'String',
    verified: 'Boolean',
    approved: 'Boolean',
    loggedin: 'Boolean',
    web_site: 'String',
    twitter_url: 'String',
    linkedin_url: 'String',
    likes_gained: 'Number',
    created_at: 'Date',
    sort_type: 'String',
};

export const assemble = {
    assemble_id: 'String',
    assemble_name: 'String',
    description: 'String',
    enter_club_id: 'String',
    enter_club_name: 'String',
    host_id: 'String',
    host_name: 'String',
    is_immediately: 'Boolean',
    is_enter_stage: 'Boolean',
    is_allow_all: 'Boolean',
    start_time: 'Date',
    photo_url: 'String',
    likes_gained: 'Number',
    created_at: 'Date',
};

export const audio = {
    audio_id: 'String',
    audio_name: 'String',
    description: 'String',
    photo_url: 'String',
    audio_url: 'String',
    audio_file_name: 'String',
    enter_club_id: 'String',
    enter_club_name: 'String',
    created_at: 'Date',
    updated_at: 'Date',
};

export const club = {
    club_id: 'String',
    club_name: 'String',
    description: 'String',
    memebership: 'String',
    user_id: 'String',
    isdue: 'Boolean',
    photo_url: 'String',
    /// added by ftf
    banner_url: 'String',
    assemble_photo_url: 'String',
    voice_photo_url: 'String',
    members: 'Number',
    is_connect_stripe: 'Boolean',
    is_private: 'Boolean',
    access_code: 'String',
    hello_audio_id: 'String',
    created_at: 'Date',
};

export const club_tier = {
    clubtier_id: 'String',
    clubtier_name: 'String',
    price: 'Number',
    price_id: 'String',
    created_at: 'Date',
    updated_at: 'Date',
};

export const group = {
    group_id: 'String',
    group_name: 'String',
    description: 'String',
    memebership: 'String',
    user_id: 'String',
    photo_url: 'String',
    members: 'Number',
    is_connect_stripe: 'Boolean',
    coupon_code: 'String',
    hello_audio_id: 'String',
    created_at: 'Date',
};

export const vcode = {
    phone: 'String',
    email: 'String',
    pcode: 'String',
    ecode: 'String',
    createdAt: 'Date',
};

export const acode = {
    acode: 'String',
    email: 'String',
    phone: 'String',
    is_used: 'Boolean',
    createdAt: 'Date',
};

export const event = {
    event_id: 'String',
    event_name: 'String',
    description: 'String',
    user_id: 'String',
    status: 'Boolean',
    member_clubs: 'Number',
    member_assembles: 'Number',
    created_at: 'Date',
    updated_at: 'Date',
};

export const member_request = {
    request_id: 'String',
    first_name: 'String',
    last_name: 'String',
    email: 'String',
    phone: 'String',
    request_state: 'Boolean',
    club_id: 'String',
    bio: 'String',
    owner_id: 'String',
    user_id: 'String',
    is_verified: 'Boolean',
    created_at: 'Date',
};

export const club_request = {
    club_id: 'String',
    club_name: 'String',
    is_approved: 'Boolean',
    access_code: 'String',
    user_id: 'String',
    first_name: 'String',
    last_name: 'String',
    phone_number: 'String',
    photo_url: 'String',
};

export const voice_note = {
    voicenote_id: 'String',
    receiver_id: 'String',
    user_id: 'String',
    audio_url: 'String',
    likes_gained: 'Number',
    enter_club_name: 'String',
    enter_club_id: 'String',
    created_at: 'Date',
    updated_at: 'Date',
};

export const memberReferral = {
    referral_user_id: 'String',
    referral_user_name: 'String',
    referral_club_id: 'String',
    referral_club_name: 'String',
    referral_id: 'String',
    referral_email: 'String',
    referral_name: 'String',
    referral_phone: 'String',
    referral_linkedin: 'String',
    referral_info: 'String',
};

export const checkURL = (url) => {
    if (url) {
        const str = url.toLowerCase();
        return str.match(/\.(jpeg|jpg|gif|png|heic)$/) != null;
    }
    return false;
};
