<template>
  <div>
    <nav text-xl mt-6 inline-flex gap-2>
      <button class="icon-btn !outline-none" @click="toggleDark()">
        <div i-carbon-sun dark:i-carbon-moon />
      </button>

      <a
        class="icon-btn"
        i-carbon-logo-github
        rel="noreferrer"
        href="https://github.com/unplugin/unplugin-jsx-string"
        target="_blank"
        title="GitHub"
      />
    </nav>
  </div>
</template>
