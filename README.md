# IRIS Memory Configuration Wizard

> :warning: DRAFT - validation in progress - this does not represent official best practices while this warning message is in place

InterSystems IRIS memory settings are crucial to ensure high performance. This simple web-based wizard helps identify best practice settings and links to the corresponding product documentation for additional background.

## Using the Wizard

First download the repository contents [as a zipfile](https://github.com/bdeboe/isc-mem-config/archive/main.zip) (and extract) or use

```
git clone git@github.com:bdeboe/isc-mem-config.git
```

Then, simply open `src/web/configurator.html` in your browser and walk through the steps:

![Screenshot](https://github.com/bdeboe/isc-mem-config/raw/main/docs/screenshot.png?raw=true)


Optionally, you can _install_ the wizard using [zpm](https://github.com/intersystems-community/zpm):

```ObjectScript
zpm install isc-mem-config
```

For now, there is no real interaction between the wizard and any IRIS instance it runs on, as the standalone aspect is conveniently versatile by itself. Feel free to share your ideas and feedback on improving this UX in the [issues](https://github.com/bdeboe/isc-mem-config/issues) section!