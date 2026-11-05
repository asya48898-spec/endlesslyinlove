
/* =========================
   STORY DATA
========================= */

const stories = [
    {
        image: "story1.jpg",
    
    },
    {
        image: "story2.jpg",
    },
    {
        image: "story3.jpg",
    },
    {
        image: "story4.jpg",
    }
];

const STORY_DURATION = 7000;

let currentStory = 0;
let storyTimer = null;
let storyStartTime = 0;
let remainingTime = STORY_DURATION;
let isStoryOpen = false;
let isPaused = false;
let storyLiked = false;
let toastTimer = null;

const storyViewer = document.getElementById("storyViewer");
const storyImage = document.getElementById("storyImage");
const storyCaption = document.getElementById("storyCaption");
const storyProgress = document.getElementById("storyProgress");

const music = document.getElementById("bgMusic");
const musicButton = document.getElementById("musicButton");

/* =========================
   TOAST
========================= */

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* =========================
   CREATE PROGRESS
========================= */

function createProgressBars() {
    storyProgress.innerHTML = "";

    stories.forEach(() => {
        const segment = document.createElement("div");
        segment.className = "progress-segment";

        const fill = document.createElement("div");
        fill.className = "progress-fill";

        segment.appendChild(fill);
        storyProgress.appendChild(segment);
    });
}

/* =========================
   OPEN STORY
========================= */

function openStory(index) {
    if (!stories.length) return;

    currentStory = Math.max(
        0,
        Math.min(index, stories.length - 1)
    );

    isStoryOpen = true;

    storyViewer.style.display = "block";
    document.body.style.overflow = "hidden";

    createProgressBars();
    showStory();
}

/* =========================
   SHOW STORY
========================= */

function showStory() {
    clearTimeout(storyTimer);

    remainingTime = STORY_DURATION;
    isPaused = false;
    storyLiked = false;

    document.getElementById("storyHeart").textContent = "♡";
    document.getElementById("storyHeart").classList.remove("active");

    const story = stories[currentStory];

    storyImage.src = story.image;
    storyCaption.textContent = story.caption;

    const fills = document.querySelectorAll(".progress-fill");

    fills.forEach((fill, index) => {
        fill.style.transition = "none";
        fill.style.width = index < currentStory ? "100%" : "0%";
    });

    startProgress();
}

/* =========================
   START PROGRESS
========================= */

function startProgress() {
    const fills = document.querySelectorAll(".progress-fill");
    const currentFill = fills[currentStory];

    if (!currentFill) return;

    storyStartTime = Date.now();

    currentFill.style.transition = "none";
    currentFill.style.width = "0%";

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (!isStoryOpen || isPaused) return;

            currentFill.style.transition =
                `width ${remainingTime}ms linear`;

            currentFill.style.width = "100%";
        });
    });

    storyTimer = setTimeout(() => {
        nextStory();
    }, remainingTime);
}

/* =========================
   NEXT STORY
========================= */

function nextStory() {
    clearTimeout(storyTimer);

    if (currentStory < stories.length - 1) {
        currentStory++;
        showStory();
    } else {
        closeStory();
    }
}

/* =========================
   PREVIOUS STORY
========================= */

function previousStory() {
    clearTimeout(storyTimer);

    if (currentStory > 0) {
        currentStory--;
        showStory();
    } else {
        showStory();
    }
}

/* =========================
   PAUSE STORY
========================= */

function pauseStory() {
    if (!isStoryOpen || isPaused) return;

    isPaused = true;

    clearTimeout(storyTimer);

    remainingTime -= Date.now() - storyStartTime;

    const fills = document.querySelectorAll(".progress-fill");
    const fill = fills[currentStory];

    if (fill) {
        const width = getComputedStyle(fill).width;
        const parentWidth = fill.parentElement.clientWidth;

        const percent = parentWidth
            ? (parseFloat(width) / parentWidth) * 100
            : 0;

        fill.style.transition = "none";
        fill.style.width = percent + "%";
    }
}

/* =========================
   RESUME STORY
========================= */

function resumeStory() {
    if (!isStoryOpen || !isPaused) return;

    isPaused = false;

    if (remainingTime <= 0) {
        nextStory();
        return;
    }

    const fills = document.querySelectorAll(".progress-fill");
    const fill = fills[currentStory];

    storyStartTime = Date.now();

    if (fill) {
        fill.style.transition =
            `width ${remainingTime}ms linear`;

        fill.style.width = "100%";
    }

    storyTimer = setTimeout(() => {
        nextStory();
    }, remainingTime);
}

/* =========================
   CLOSE STORY
========================= */

function closeStory() {
    clearTimeout(storyTimer);

    isStoryOpen = false;
    isPaused = false;

    storyViewer.style.display = "none";
    document.body.style.overflow = "";
}

/* =========================
   STORY LIKE
========================= */

function likeStory() {
    storyLiked = !storyLiked;

    const heart = document.getElementById("storyHeart");

    heart.textContent = storyLiked ? "♥" : "♡";
    heart.classList.toggle("active", storyLiked);

    showToast(
        storyLiked ? "Story liked" : "Like removed"
    );
}

/* =========================
   STORY REPLY
========================= */

function replyStory() {
    const input = document.getElementById("storyReply");

    if (!input.value.trim()) {
        input.focus();
        showToast("Write a message first");
        return;
    }

    showToast("Your message: " + input.value);

    input.value = "";
}

/* =========================
   STORY SHARE
========================= */

function shareStory() {
    if (navigator.share) {
        navigator.share({
            title: "My Soulmates",
            text: stories[currentStory].caption,
            url: window.location.href
        }).catch(() => {});
    } else {
        showToast("Share this page with your loved one");
    }
}

/* =========================
   STORY KEYBOARD
========================= */

document.addEventListener("keydown", function(event) {
    if (!isStoryOpen) return;

    if (event.key === "ArrowRight") nextStory();
    if (event.key === "ArrowLeft") previousStory();
    if (event.key === "Escape") closeStory();
    if (event.code === "Space") {
        event.preventDefault();
        isPaused ? resumeStory() : pauseStory();
    }
});

/* =========================
   STORY PRESS TO PAUSE
========================= */

const storyScreen = document.querySelector(".story-screen");

storyScreen.addEventListener("pointerdown", function(event) {
    if (
        event.target.closest("button") ||
        event.target.closest("input")
    ) return;

    pauseStory();
});

storyScreen.addEventListener("pointerup", resumeStory);
storyScreen.addEventListener("pointercancel", resumeStory);
storyScreen.addEventListener("pointerleave", resumeStory);

/* =========================
   LIKE POST
========================= */

function likePost(button) {
    const count = document.getElementById("likeCount");

    const liked = button.classList.toggle("liked");

    button.setAttribute("aria-pressed", liked);

    count.textContent = liked
        ? "1,025 likes"
        : "1,024 likes";
}

/* =========================
   SAVE POST
========================= */

function savePost(button) {
    const saved = button.classList.toggle("saved");

    button.setAttribute("aria-pressed", saved);

    showToast(
        saved ? "Post saved" : "Post removed from saved"
    );
}

/* =========================
   COMMENT
========================= */

function commentPost() {
    const area = document.getElementById("commentArea");

    const isVisible = area.style.display === "flex";

    area.style.display = isVisible ? "none" : "flex";

    if (!isVisible) {
        document.getElementById("commentInput").focus();
    }
}

/* =========================
   SEND COMMENT
========================= */

function sendComment() {
    const input = document.getElementById("commentInput");
    const list = document.getElementById("commentsList");

    const message = input.value.trim();

    if (!message) {
        showToast("Write a comment first");
        return;
    }

    const item = document.createElement("div");

    item.className = "comment-item";

    const username = document.createElement("b");
    username.textContent = "dencaslo ";

    item.appendChild(username);
    item.appendChild(document.createTextNode(message));

    list.appendChild(item);

    input.value = "";

    showToast("Comment added");
}

/* =========================
   SHARE POST
========================= */

function sharePost() {
    if (navigator.share) {
        navigator.share({
            title: "My Soulmates",
            text: "A little website made with love ♡",
            url: window.location.href
        }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
            .then(() => showToast("Link copied"))
            .catch(() => showToast("Unable to copy link"));
    } else {
        showToast("Share this website using its link");
    }
}

/* =========================
   LOVE PAGE
========================= */

function showLove() {
    closeStory();

    document.getElementById("homePage").style.display = "none";
    document.getElementById("navbar").style.display = "none";
    document.getElementById("lovePage").style.display = "block";

    window.scrollTo(0, 0);
}

function goBack() {
    document.getElementById("lovePage").style.display = "none";
    document.getElementById("homePage").style.display = "block";
    document.getElementById("navbar").style.display = "flex";

    window.scrollTo(0, 0);
}

/* =========================
   MUSIC
========================= */

function toggleMusic() {
    if (music.paused) {
        music.play()
            .then(() => {
                musicButton.textContent = "♫ Pause Music";
            })
            .catch(() => {
                showToast("Music file not found. Check nothingbj.mp3");
            });
    } else {
        music.pause();
        musicButton.textContent = "♫ Play Music";
    }
}

/* =========================
   MUSIC STATE
========================= */

music.addEventListener("ended", () => {
    musicButton.textContent = "♫ Play Music";
});

music.addEventListener("error", () => {
    showToast("Cannot load music. Check nothing.mp3");
});
