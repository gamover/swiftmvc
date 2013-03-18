module.exports = {
    app: {
        type: "dir",
        include: {

            config: {
                type: "dir",
                include: {

                    'config.js': {
                        type: "file",
                        template: "config.js"
                    },
                    'routes.js': {
                        type: "file",
                        template: "routes.js"
                    }
                }
            },

            modules: {
                type: "dir",
                include: {

                    index: {
                        type: "dir",
                        include: {

                            model: {
                                type: "dir",
                                include: {

                                    'model.js': {
                                        type: "file",
                                        template: "model.js"
                                    }
                                }
                            },
                            view: {
                                type: "dir",
                                include: {

                                    'index.swig': {
                                        type: "file",
                                        template: "view.swig"
                                    }
                                }
                            },
                            controller: {
                                type: "dir",
                                include: {

                                    'index.js': {
                                        type: "file",
                                        template: "controller.js"
                                    }
                                }
                            },
                            modules: {
                                type: "dir",
                                include: {}
                            }
                        }
                    }
                }
            },

            view: {
                type: "dir",
                include: {

                    layouts: {
                        type: "dir",
                        include: {

                            'main.swig': {
                                type: "file",
                                template: "layout.swig"
                            }
                        }
                    }
                }
            }
        }
    },
    'app.js': {
        type: "file",
        template: "app.js"
    },
    'package.json': {
        type: "file",
        template: "package.json"
    }
};