package com.giproject.security.jwt;

public record ProviderInfo(String provider, String providerId) {
    public static ProviderInfo none() { return new ProviderInfo(null, null); }

    public boolean present() {
        return provider != null && !provider.isBlank()
            && providerId != null && !providerId.isBlank();
    }

    public ProviderInfo requireUpper() {
        if (provider == null) return this;
        return new ProviderInfo(provider.toUpperCase(), providerId);
    }

    @Override 
    public String toString() {
        return present() ? provider.toUpperCase() + ":" + providerId : "LOCAL";
    }
}
