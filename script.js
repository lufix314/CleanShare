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

function displayResult(original, result) {
  const resultDiv = document.getElementById("result");
  const resultContent = document.getElementById("resultContent");

  if (result.cleaned && result.platform) {
    const removedText =
      result.removedParams.length > 0
        ? `<span class="highlight">${result.removedParams.join(", ")}</span>`
        : '<span class="muted">None</span>';

    resultContent.innerHTML = `
            <div class="result-section">
                <div class="result-header">
                    <h3 class="result-title">${result.platform}</h3>
                    <span class="result-status success">Cleaned</span>
                </div>
                <div class="result-section">
                    <p class="result-label">Removed parameters</p>
                    <p class="result-value">${removedText}</p>
                </div>
                <div class="result-section">
                    <p class="result-label">Clean URL</p>
                    <div class="code-box">${escapeHtml(result.cleaned)}</div>
                </div>
            </div>
        `;
    resultDiv.classList.add("visible");
    updateCopyButton(true);
    return;
  }

  if (!result.platform && isValidUrl(original)) {
    resultContent.innerHTML = `
            <div class="not-recognized">
                <h3 class="not-recognized-title">Platform not recognized</h3>
                <p class="not-recognized-description">This URL does not match a known supported platform.</p>
                <div class="info-box">
                    <p class="info-box-title">CleanShare will:</p>
                    <ul class="info-list">
                        <li>Remove standard tracking parameters (utm_*, gclid, fbclid, etc.)</li>
                        <li>Preserve affiliate and promotional parameters</li>
                        <li>May miss platform-specific tracking</li>
                    </ul>
                </div>
                <button
                    id="cleanAnywayBtn"
                    class="button-primary"
                >
                    Clean Anyway
                </button>
            </div>
        `;
    resultDiv.classList.add("visible");
    document.getElementById("copyBtn").disabled = true;

    document.getElementById("cleanAnywayBtn").addEventListener("click", () => {
      const result = cleanGenericUrl(original);
      displayResult(original, result);
    });
    return;
  }

  resultContent.innerHTML = `
        <div class="error-message">
            <p>Please enter a valid URL</p>
        </div>
    `;
  resultDiv.classList.add("visible");
  updateCopyButton(false);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
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

  cleanBtn.addEventListener("click", () => {
    const url = urlInput.value.trim();
    if (!url) return;

    try {
      const result = cleanUrl(url);
      displayResult(url, result);
    } catch (error) {
      const resultDiv = document.getElementById("result");
      const resultContent = document.getElementById("resultContent");

      resultContent.innerHTML = `
            <div class="error-message">
                <p>Invalid URL: ${escapeHtml(error.message)}</p>
            </div>
        `;
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
