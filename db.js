const { createClient } = require("@supabase/supabase-js");
const config = require("./config");

const supabase = createClient(config.supabase.url, config.supabase.key);

// =============== Create ===============
const createBooking = async (data) => {
    const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
            patient_name: data.patient_name,
            patient_email: data.patient_email,
            patient_phone: data.patient_phone || null,
            service: data.service,
            preferred_date: data.preferred_date || null,
            preferred_time: data.preferred_time || null,
            message: data.message || null,
        })
        .select()
        .single();

    if (error) throw error;
    return booking;
};

// ============== Read ===============
const getBookingById = async (id) => {
    const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
};

// Short ID lookup
const getBookingByShortId = async (shortId) => {
    const { data, error } = await supabase.rpc("get_booking_by_short_id", {
        prefix: shortId,
    });

    if (error) throw error;
    return data;
};

const getBookingsByDate = async (
    dateStr,
    statuses = ["confirmed", "pending"],
) => {
    const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("preferred_date", dateStr)
        .in("status", statuses)
        .order("preferred_time")
        .order("created_at");

    if (error) return [];
    return data || [];
};

const getBookingsByDateRange = async (
    startDateStr,
    endDateStr,
    statuses = ["confirmed", "pending"],
) => {
    const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .gte("preferred_date", startDateStr)
        .lte("preferred_date", endDateStr)
        .in("status", statuses)
        .order("preferred_date")
        .order("preferred_time")
        .order("created_at");

    if (error) return [];
    return data || [];
};

const getPendingBookings = async () => {
    const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) return [];
    return data || [];
};

const getAllBookings = async (status = null) => {
    let query = supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

    if (status && status !== "all") {
        query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return [];
    return data || [];
};

// =============== Update ===============
const updateBookingStatus = async (id, newStatus) => {
    const { data, error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ============== Stats ===============
const getBookingStats = async () => {
    const { data: all } = await supabase.from("bookings").select("*");
    if (!all)
        return {
            total: 0,
            pending: 0,
            confirmed: 0,
            cancelled: 0,
            completed: 0,
        };

    return {
        total: all.length,
        pending: all.filter((b) => b.status === "pending").length,
        confirmed: all.filter((b) => b.status === "confirmed").length,
        cancelled: all.filter((b) => b.status === "cancelled").length,
        completed: all.filter((b) => b.status === "completed").length,
    };
};

module.exports = {
    createBooking,
    getBookingById,
    getBookingByShortId,
    getBookingsByDate,
    getBookingsByDateRange,
    getPendingBookings,
    getAllBookings,
    updateBookingStatus,
    getBookingStats,
};
