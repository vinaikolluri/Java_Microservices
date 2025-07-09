package com.attendance_management.model;

public enum LeaveType {
    SICK(12),    // 12 days per year
    CASUAL(12),  // 12 days per year
    OTHER(0);    // Unlimited unpaid leaves

    private final int defaultYearlyQuota;

    LeaveType(int defaultYearlyQuota) {
        this.defaultYearlyQuota = defaultYearlyQuota;
    }

    public int getDefaultYearlyQuota() {
        return defaultYearlyQuota;
    }

    public boolean isUnpaid() {
        return this == OTHER;
    }
}