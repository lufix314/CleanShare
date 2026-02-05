"use strict";

function updateCopyButton(enabled) {
  const copyBtn = document.getElementById("copyBtn");
  copyBtn.disabled = !enabled;
}

const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "utm_source_platform",
  "utm_marketing_tactic",
  "utm_creative_format",
];

const PLATFORM_TRACKING = [
  "fbclid",
  "gclid",
  "msclkid",
  "li_fat_id",
  "igsh",
  "igshid",
  "twclid",
  "dclid",
  "ttclid",
];

const AFFILIATE_PARAMS = [
  "aff",
  "affiliate",
  "aff_id",
  "affiliate_id",
  "partner",
  "tag",
  "promo",
  "coupon",
  "discount",
];

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function isAffiliateOrPromotional(param) {
  const lowerParam = param.toLowerCase();
  return AFFILIATE_PARAMS.some((aff) => lowerParam.startsWith(aff));
}

function detectPlatform(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();

  for (const [platformKey, rules] of Object.entries(PLATFORM_RULES)) {
    if (
      rules.domains.some(
        (domain) => hostname === domain || hostname.endsWith("." + domain),
      )
    ) {
      return { key: platformKey, rules };
    }
  }

  return null;
}

function getParamsToRemove(urlObj, platform) {
  const searchParams = urlObj.searchParams;
  const removedParams = [];
  const paramsToKeep = new Set();

  if (platform.rules.removeAll) {
    for (const param of searchParams.keys()) {
      removedParams.push(param);
    }
    return { removedParams, paramsToKeep };
  }

  for (const param of searchParams.keys()) {
    const shouldRemove =
      (platform.rules.removeSelected &&
        platform.rules.removeSelected.includes(param)) ||
      UTM_PARAMS.includes(param) ||
      PLATFORM_TRACKING.includes(param);

    const shouldKeep =
      (platform.rules.keepSelected &&
        platform.rules.keepSelected.includes(param)) ||
      isAffiliateOrPromotional(param);

    if (shouldKeep) {
      paramsToKeep.add(param);
    } else if (shouldRemove) {
      removedParams.push(param);
    }
  }

  return { removedParams, paramsToKeep };
}

function cleanUrl(url) {
  const urlObj = new URL(url);
  const platform = detectPlatform(url);

  if (!platform) {
    return {
      cleaned: null,
      platform: null,
      removedParams: [],
    };
  }

  const { removedParams } = getParamsToRemove(urlObj, platform);

  removedParams.forEach((param) => {
    urlObj.searchParams.delete(param);
  });

  return {
    cleaned: urlObj.toString(),
    platform: platform.rules.name,
    removedParams,
  };
}

function cleanGenericUrl(url) {
  const urlObj = new URL(url);
  const removedParams = [];

  for (const param of urlObj.searchParams.keys()) {
    if (UTM_PARAMS.includes(param) || PLATFORM_TRACKING.includes(param)) {
      removedParams.push(param);
      urlObj.searchParams.delete(param);
    }
  }

  return {
    cleaned: urlObj.toString(),
    platform: "Generic Clean",
    removedParams,
  };
}

function hideAllTemplates() {
  const templates = document.querySelectorAll(".result-template");
  templates.forEach((template) => {
    template.classList.remove("visible");
  });
}

function showTemplate(templateId) {
  hideAllTemplates();
  const template = document.getElementById(templateId);
  if (template) {
    template.classList.add("visible");
  }
}

function displayResult(original, result) {
  const resultDiv = document.getElementById("result");

  if (result.cleaned && result.platform) {
    showTemplate("templateCleaned");

    const cleanedPlatform = document.getElementById("cleanedPlatform");
    const cleanedParams = document.getElementById("cleanedParams");
    const cleanedUrl = document.getElementById("cleanedUrl");

    if (cleanedPlatform) cleanedPlatform.textContent = result.platform;

    if (cleanedParams) {
      if (result.removedParams.length > 0) {
        const highlightSpan = document.createElement("span");
        highlightSpan.className = "highlight";
        highlightSpan.textContent = result.removedParams.join(", ");
        cleanedParams.textContent = "";
        cleanedParams.appendChild(highlightSpan);
      } else {
        const mutedSpan = document.createElement("span");
        mutedSpan.className = "muted";
        mutedSpan.textContent = "None";
        cleanedParams.textContent = "";
        cleanedParams.appendChild(mutedSpan);
      }
    }

    if (cleanedUrl) {
      cleanedUrl.textContent = result.cleaned;
    }

    resultDiv.classList.add("visible");
    updateCopyButton(true);
    return;
  }

  if (!result.platform && isValidUrl(original)) {
    showTemplate("templateNotRecognized");
    resultDiv.classList.add("visible");
    document.getElementById("copyBtn").disabled = true;
    return;
  }

  showTemplate("templateInvalidInput");
  resultDiv.classList.add("visible");
  updateCopyButton(false);
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const toast = document.getElementById("toast");
      toast.classList.add("show");
      toast.classList.remove("hide");

      setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hide");
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("urlInput");
  const cleanBtn = document.getElementById("cleanBtn");
  const copyBtn = document.getElementById("copyBtn");

  updateCopyButton(false);

  urlInput.addEventListener("input", () => {
    cleanBtn.disabled = !isValidUrl(urlInput.value);
  });

  urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && isValidUrl(urlInput.value)) {
      cleanBtn.click();
    }
  });

  document
    .getElementById("cleanAnywayBtn")
    .addEventListener("click", () => {
      const url = urlInput.value.trim();
      if (!url) return;

      try {
        const result = cleanGenericUrl(url);
        displayResult(url, result);
      } catch (error) {
        const resultDiv = document.getElementById("result");
        const errorMessage = document.getElementById("errorMessage");

        showTemplate("templateInvalid");

        if (errorMessage) {
          errorMessage.textContent = "Invalid URL: " + error.message;
        }

        resultDiv.classList.add("visible");
        updateCopyButton(false);
      }
    });

  cleanBtn.addEventListener("click", () => {
    const url = urlInput.value.trim();
    if (!url) return;

    try {
      const result = cleanUrl(url);
      displayResult(url, result);
    } catch (error) {
      const resultDiv = document.getElementById("result");
      const errorMessage = document.getElementById("errorMessage");

      showTemplate("templateInvalid");

      if (errorMessage) {
        errorMessage.textContent = "Invalid URL: " + error.message;
      }

      resultDiv.classList.add("visible");
      updateCopyButton(false);
    }
  });

  copyBtn.addEventListener("click", () => {
    const resultDiv = document.getElementById("result");
    if (resultDiv.classList.contains("visible")) {
      const cleanUrlElement = resultDiv.querySelector(".code-box");
      if (cleanUrlElement) {
        copyToClipboard(cleanUrlElement.textContent);
      }
    }
  });
});
