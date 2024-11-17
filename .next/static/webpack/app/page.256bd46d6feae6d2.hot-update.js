"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/page",{

/***/ "(app-pages-browser)/./app/components/MainPage.tsx":
/*!*************************************!*\
  !*** ./app/components/MainPage.tsx ***!
  \*************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var _components_SectionsView__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @/components/SectionsView */ \"(app-pages-browser)/./app/components/SectionsView.tsx\");\n/* harmony import */ var _components_Settings__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @/components/Settings */ \"(app-pages-browser)/./app/components/Settings.tsx\");\n/* harmony import */ var _components_base_LoadableIcon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @/components/base/LoadableIcon */ \"(app-pages-browser)/./app/components/base/LoadableIcon.tsx\");\n/* harmony import */ var _components_ui_button__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/components/ui/button */ \"(app-pages-browser)/./app/components/ui/button.tsx\");\n/* harmony import */ var _components_ui_input__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/components/ui/input */ \"(app-pages-browser)/./app/components/ui/input.tsx\");\n/* harmony import */ var _consts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/consts */ \"(app-pages-browser)/./app/consts.ts\");\n/* harmony import */ var _remix_run_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @remix-run/react */ \"(app-pages-browser)/./node_modules/@remix-run/react/dist/esm/components.js\");\n/* harmony import */ var _barrel_optimize_names_ClipboardPlus_RotateCw_Search_X_lucide_react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! __barrel_optimize__?names=ClipboardPlus,RotateCw,Search,X!=!lucide-react */ \"(app-pages-browser)/./node_modules/lucide-react/dist/esm/icons/search.js\");\n/* harmony import */ var _barrel_optimize_names_ClipboardPlus_RotateCw_Search_X_lucide_react__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! __barrel_optimize__?names=ClipboardPlus,RotateCw,Search,X!=!lucide-react */ \"(app-pages-browser)/./node_modules/lucide-react/dist/esm/icons/x.js\");\n/* harmony import */ var _barrel_optimize_names_ClipboardPlus_RotateCw_Search_X_lucide_react__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! __barrel_optimize__?names=ClipboardPlus,RotateCw,Search,X!=!lucide-react */ \"(app-pages-browser)/./node_modules/lucide-react/dist/esm/icons/rotate-cw.js\");\n/* harmony import */ var _barrel_optimize_names_ClipboardPlus_RotateCw_Search_X_lucide_react__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! __barrel_optimize__?names=ClipboardPlus,RotateCw,Search,X!=!lucide-react */ \"(app-pages-browser)/./node_modules/lucide-react/dist/esm/icons/clipboard-plus.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var sonner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! sonner */ \"(app-pages-browser)/./node_modules/sonner/dist/index.mjs\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n\n\n\n\n\n\n\nasync function MainPage(param) {\n    let { fanfics, sections } = param;\n    var _addFanficFetcher_data, _checkUpdatesFetcher_data;\n    _s();\n    const addFanficFetcher = (0,_remix_run_react__WEBPACK_IMPORTED_MODULE_3__.useFetcher)();\n    const addFanficSuccessState = (_addFanficFetcher_data = addFanficFetcher.data) === null || _addFanficFetcher_data === void 0 ? void 0 : _addFanficFetcher_data.success;\n    const checkUpdatesFetcher = (0,_remix_run_react__WEBPACK_IMPORTED_MODULE_3__.useFetcher)();\n    const isCheckUpdatesSubmitting = checkUpdatesFetcher.state === \"submitting\";\n    const checkUpdatesSuccessState = (_checkUpdatesFetcher_data = checkUpdatesFetcher.data) === null || _checkUpdatesFetcher_data === void 0 ? void 0 : _checkUpdatesFetcher_data.success;\n    const [searchInput, setSearchInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    react__WEBPACK_IMPORTED_MODULE_1___default().useEffect({\n        \"MainPage.useEffect\": ()=>{\n            var _checkUpdatesFetcher_data;\n            if (checkUpdatesSuccessState && !((_checkUpdatesFetcher_data = checkUpdatesFetcher.data) === null || _checkUpdatesFetcher_data === void 0 ? void 0 : _checkUpdatesFetcher_data.isCache)) {\n                var _checkUpdatesFetcher_data1;\n                (_checkUpdatesFetcher_data1 = checkUpdatesFetcher.data) === null || _checkUpdatesFetcher_data1 === void 0 ? void 0 : _checkUpdatesFetcher_data1.data.updatedFanfics.map({\n                    \"MainPage.useEffect\": (fanficTitle)=>sonner__WEBPACK_IMPORTED_MODULE_2__.toast.success(\"Fic \".concat(fanficTitle, \" updated successfully\"))\n                }[\"MainPage.useEffect\"]);\n            } else if (checkUpdatesFetcher.data && !checkUpdatesFetcher.data.success) {\n                sonner__WEBPACK_IMPORTED_MODULE_2__.toast.error(\"An error occurred: \".concat(checkUpdatesFetcher.data.data));\n            }\n        }\n    }[\"MainPage.useEffect\"], [\n        checkUpdatesFetcher.data,\n        checkUpdatesSuccessState\n    ]);\n    react__WEBPACK_IMPORTED_MODULE_1___default().useEffect({\n        \"MainPage.useEffect\": ()=>{\n            if (addFanficSuccessState === false) {\n                var _addFanficFetcher_data;\n                const message = (_addFanficFetcher_data = addFanficFetcher.data) === null || _addFanficFetcher_data === void 0 ? void 0 : _addFanficFetcher_data.message;\n                if (message === null || message === void 0 ? void 0 : message.includes(\"duplicate key value violates unique constraint\")) {\n                    sonner__WEBPACK_IMPORTED_MODULE_2__.toast.error(\"This fic already exists :)\");\n                } else {\n                    sonner__WEBPACK_IMPORTED_MODULE_2__.toast.error(\"An error occurred: \".concat(message));\n                }\n            }\n        }\n    }[\"MainPage.useEffect\"], [\n        addFanficSuccessState,\n        addFanficFetcher.data\n    ]);\n    const handleAddFanficFromClipboard = async ()=>{\n        try {\n            const clipboardText = await navigator.clipboard.readText();\n            if (clipboardText.startsWith(\"\".concat(_consts__WEBPACK_IMPORTED_MODULE_4__.AO3_LINK, \"/works/\"))) {\n                addFanficFetcher.submit({\n                    url: clipboardText\n                }, {\n                    method: \"POST\",\n                    action: \"/api/sections/3/fanfics\"\n                });\n            } else {\n                sonner__WEBPACK_IMPORTED_MODULE_2__.toast.error(\"Invalid URL. Please copy a valid AO3 fanfic URL\");\n            }\n        } catch (error) {\n            console.error(\"Failed to read from clipboard: \", error);\n            sonner__WEBPACK_IMPORTED_MODULE_2__.toast.error(\"Failed to read from clipboard\");\n        }\n    };\n    const handleCheckForUpdates = ()=>{\n        checkUpdatesFetcher.submit(null, {\n            method: \"POST\",\n            action: \"/api/check-for-updates\"\n        });\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"flex flex-col h-screen\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"sticky top-0 z-20 p-4 shadow-md bg-accent\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"flex items-center justify-end gap-2 \",\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"justify-center relative\",\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_input__WEBPACK_IMPORTED_MODULE_5__.Input, {\n                                    value: searchInput,\n                                    className: \"pl-8\",\n                                    placeholder: \"Search\",\n                                    onChange: (event)=>setSearchInput(event.target.value)\n                                }, void 0, false, {\n                                    fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                                    lineNumber: 83,\n                                    columnNumber: 7\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ClipboardPlus_RotateCw_Search_X_lucide_react__WEBPACK_IMPORTED_MODULE_6__[\"default\"], {\n                                    className: \"pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50\"\n                                }, void 0, false, {\n                                    fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                                    lineNumber: 89,\n                                    columnNumber: 7\n                                }, this),\n                                searchInput && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_button__WEBPACK_IMPORTED_MODULE_7__.Button, {\n                                    onClick: ()=>setSearchInput(\"\"),\n                                    variant: \"ghost\",\n                                    size: \"icon\",\n                                    className: \"absolute right-1 top-1/2 -translate-y-1/2 \",\n                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_barrel_optimize_names_ClipboardPlus_RotateCw_Search_X_lucide_react__WEBPACK_IMPORTED_MODULE_8__[\"default\"], {}, void 0, false, {\n                                        fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                                        lineNumber: 97,\n                                        columnNumber: 9\n                                    }, this)\n                                }, void 0, false, {\n                                    fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                                    lineNumber: 91,\n                                    columnNumber: 8\n                                }, this)\n                            ]\n                        }, void 0, true, {\n                            fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                            lineNumber: 82,\n                            columnNumber: 6\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_button__WEBPACK_IMPORTED_MODULE_7__.Button, {\n                            type: \"button\",\n                            className: \"ml-4 w-fit\",\n                            onClick: handleCheckForUpdates,\n                            disabled: isCheckUpdatesSubmitting,\n                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_base_LoadableIcon__WEBPACK_IMPORTED_MODULE_9__[\"default\"], {\n                                DefaultIcon: _barrel_optimize_names_ClipboardPlus_RotateCw_Search_X_lucide_react__WEBPACK_IMPORTED_MODULE_10__[\"default\"],\n                                state: checkUpdatesFetcher.state,\n                                successState: checkUpdatesSuccessState\n                            }, void 0, false, {\n                                fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                                lineNumber: 107,\n                                columnNumber: 7\n                            }, this)\n                        }, void 0, false, {\n                            fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                            lineNumber: 101,\n                            columnNumber: 6\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_button__WEBPACK_IMPORTED_MODULE_7__.Button, {\n                            type: \"button\",\n                            onClick: handleAddFanficFromClipboard,\n                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_base_LoadableIcon__WEBPACK_IMPORTED_MODULE_9__[\"default\"], {\n                                DefaultIcon: _barrel_optimize_names_ClipboardPlus_RotateCw_Search_X_lucide_react__WEBPACK_IMPORTED_MODULE_11__[\"default\"],\n                                state: addFanficFetcher.state,\n                                successState: addFanficSuccessState\n                            }, void 0, false, {\n                                fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                                lineNumber: 114,\n                                columnNumber: 7\n                            }, this)\n                        }, void 0, false, {\n                            fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                            lineNumber: 113,\n                            columnNumber: 6\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_Settings__WEBPACK_IMPORTED_MODULE_12__.SettingsModal, {}, void 0, false, {\n                            fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                            lineNumber: 120,\n                            columnNumber: 6\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                    lineNumber: 81,\n                    columnNumber: 5\n                }, this)\n            }, void 0, false, {\n                fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                lineNumber: 80,\n                columnNumber: 4\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"flex-1 overflow-y-auto\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_SectionsView__WEBPACK_IMPORTED_MODULE_13__[\"default\"], {\n                    searchInput: searchInput\n                }, void 0, false, {\n                    fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                    lineNumber: 124,\n                    columnNumber: 5\n                }, this)\n            }, void 0, false, {\n                fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n                lineNumber: 123,\n                columnNumber: 4\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"/Users/hagar.ishay/fanfic/app/components/MainPage.tsx\",\n        lineNumber: 79,\n        columnNumber: 3\n    }, this);\n}\n_s(MainPage, \"Zw8n9kydsQB2p23sHzm3ry9ayqI=\", false, function() {\n    return [\n        _remix_run_react__WEBPACK_IMPORTED_MODULE_3__.useFetcher,\n        _remix_run_react__WEBPACK_IMPORTED_MODULE_3__.useFetcher\n    ];\n});\n_c = MainPage;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MainPage);\nvar _c;\n$RefreshReg$(_c, \"MainPage\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC9jb21wb25lbnRzL01haW5QYWdlLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFcUQ7QUFDQztBQUNJO0FBQ1Y7QUFDRjtBQUNYO0FBSVc7QUFDb0I7QUFDMUI7QUFDVDtBQUUvQixlQUFlYyxTQUFTLEtBR3FCO1FBSHJCLEVBQ3ZCQyxPQUFPLEVBQ1BDLFFBQVEsRUFDb0MsR0FIckI7UUFLT0Msd0JBSUdDOztJQUxqQyxNQUFNRCxtQkFBbUJYLDREQUFVQTtJQUNuQyxNQUFNYSx5QkFBd0JGLHlCQUFBQSxpQkFBaUJHLElBQUksY0FBckJILDZDQUFBQSx1QkFBdUJJLE9BQU87SUFFNUQsTUFBTUgsc0JBQXNCWiw0REFBVUE7SUFDdEMsTUFBTWdCLDJCQUEyQkosb0JBQW9CSyxLQUFLLEtBQUs7SUFDL0QsTUFBTUMsNEJBQTJCTiw0QkFBQUEsb0JBQW9CRSxJQUFJLGNBQXhCRixnREFBQUEsMEJBQTBCRyxPQUFPO0lBRWxFLE1BQU0sQ0FBQ0ksYUFBYUMsZUFBZSxHQUFHZCwrQ0FBUUEsQ0FBQztJQUUvQ0Qsc0RBQWU7OEJBQUM7Z0JBQ2tCTztZQUFqQyxJQUFJTSw0QkFBNEIsR0FBQ04sNEJBQUFBLG9CQUFvQkUsSUFBSSxjQUF4QkYsZ0RBQUFBLDBCQUEwQlUsT0FBTyxHQUFFO29CQUNuRVY7aUJBQUFBLDZCQUFBQSxvQkFBb0JFLElBQUksY0FBeEJGLGlEQUFBQSwyQkFBMEJFLElBQUksQ0FBQ1MsY0FBYyxDQUFDQyxHQUFHOzBDQUFDLENBQUNDLGNBQ2xEbEIseUNBQUtBLENBQUNRLE9BQU8sQ0FBQyxPQUFtQixPQUFaVSxhQUFZOztZQUVuQyxPQUFPLElBQUliLG9CQUFvQkUsSUFBSSxJQUFJLENBQUNGLG9CQUFvQkUsSUFBSSxDQUFDQyxPQUFPLEVBQUU7Z0JBQ3pFUix5Q0FBS0EsQ0FBQ21CLEtBQUssQ0FBQyxzQkFBb0QsT0FBOUJkLG9CQUFvQkUsSUFBSSxDQUFDQSxJQUFJO1lBQ2hFO1FBQ0Q7NkJBQUc7UUFBQ0Ysb0JBQW9CRSxJQUFJO1FBQUVJO0tBQXlCO0lBRXZEYixzREFBZTs4QkFBQztZQUNmLElBQUlRLDBCQUEwQixPQUFPO29CQUNwQkY7Z0JBQWhCLE1BQU1nQixXQUFVaEIseUJBQUFBLGlCQUFpQkcsSUFBSSxjQUFyQkgsNkNBQUFBLHVCQUF1QmdCLE9BQU87Z0JBQzlDLElBQUlBLG9CQUFBQSw4QkFBQUEsUUFBU0MsUUFBUSxDQUFDLG1EQUFtRDtvQkFDeEVyQix5Q0FBS0EsQ0FBQ21CLEtBQUssQ0FBQztnQkFDYixPQUFPO29CQUNObkIseUNBQUtBLENBQUNtQixLQUFLLENBQUMsc0JBQThCLE9BQVJDO2dCQUNuQztZQUNEO1FBQ0Q7NkJBQUc7UUFBQ2Q7UUFBdUJGLGlCQUFpQkcsSUFBSTtLQUFDO0lBRWpELE1BQU1lLCtCQUErQjtRQUNwQyxJQUFJO1lBQ0gsTUFBTUMsZ0JBQWdCLE1BQU1DLFVBQVVDLFNBQVMsQ0FBQ0MsUUFBUTtZQUN4RCxJQUFJSCxjQUFjSSxVQUFVLENBQUMsR0FBbUIsT0FBaEJuQyw2Q0FBZSxFQUFDLGFBQVc7Z0JBQzFEWSxpQkFBaUJ5QixNQUFNLENBQ3RCO29CQUFFQyxLQUFLUDtnQkFBYyxHQUNyQjtvQkFDQ1EsUUFBUTtvQkFDUkMsUUFBUTtnQkFDVDtZQUVGLE9BQU87Z0JBQ05oQyx5Q0FBS0EsQ0FBQ21CLEtBQUssQ0FBQztZQUNiO1FBQ0QsRUFBRSxPQUFPQSxPQUFPO1lBQ2ZjLFFBQVFkLEtBQUssQ0FBQyxtQ0FBbUNBO1lBQ2pEbkIseUNBQUtBLENBQUNtQixLQUFLLENBQUM7UUFDYjtJQUNEO0lBRUEsTUFBTWUsd0JBQXdCO1FBQzdCN0Isb0JBQW9Cd0IsTUFBTSxDQUFDLE1BQU07WUFDaENFLFFBQVE7WUFDUkMsUUFBUTtRQUNUO0lBQ0Q7SUFFQSxxQkFDQyw4REFBQ0c7UUFBSUMsV0FBVTs7MEJBQ2QsOERBQUNEO2dCQUFJQyxXQUFVOzBCQUNkLDRFQUFDRDtvQkFBSUMsV0FBVTs7c0NBQ2QsOERBQUNEOzRCQUFJQyxXQUFVOzs4Q0FDZCw4REFBQzdDLHVEQUFLQTtvQ0FDTDhDLE9BQU96QjtvQ0FDUHdCLFdBQVU7b0NBQ1ZFLGFBQVk7b0NBQ1pDLFVBQVUsQ0FBQ0MsUUFBVTNCLGVBQWUyQixNQUFNQyxNQUFNLENBQUNKLEtBQUs7Ozs7Ozs4Q0FFdkQsOERBQUN6QywyR0FBTUE7b0NBQUN3QyxXQUFVOzs7Ozs7Z0NBQ2pCeEIsNkJBQ0EsOERBQUN0Qix5REFBTUE7b0NBQ05vRCxTQUFTLElBQU03QixlQUFlO29DQUM5QjhCLFNBQVE7b0NBQ1JDLE1BQUs7b0NBQ0xSLFdBQVU7OENBRVYsNEVBQUN2QywyR0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7c0NBSUwsOERBQUNQLHlEQUFNQTs0QkFDTnVELE1BQUs7NEJBQ0xULFdBQVU7NEJBQ1ZNLFNBQVNSOzRCQUNUWSxVQUFVckM7c0NBRVYsNEVBQUNwQixxRUFBWUE7Z0NBQ1owRCxhQUFhcEQsNEdBQVFBO2dDQUNyQmUsT0FBT0wsb0JBQW9CSyxLQUFLO2dDQUNoQ3NDLGNBQWNyQzs7Ozs7Ozs7Ozs7c0NBR2hCLDhEQUFDckIseURBQU1BOzRCQUFDdUQsTUFBSzs0QkFBU0gsU0FBU3BCO3NDQUM5Qiw0RUFBQ2pDLHFFQUFZQTtnQ0FDWjBELGFBQWFyRCw0R0FBYUE7Z0NBQzFCZ0IsT0FBT04saUJBQWlCTSxLQUFLO2dDQUM3QnNDLGNBQWMxQzs7Ozs7Ozs7Ozs7c0NBR2hCLDhEQUFDbEIsZ0VBQWFBOzs7Ozs7Ozs7Ozs7Ozs7OzBCQUdoQiw4REFBQytDO2dCQUFJQyxXQUFVOzBCQUNkLDRFQUFDakQsaUVBQVlBO29CQUFDeUIsYUFBYUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSS9CO0dBL0dlWDs7UUFJV1Isd0RBQVVBO1FBR1BBLHdEQUFVQTs7O0tBUHhCUTtBQWlIZixpRUFBZUEsUUFBUUEsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL2hhZ2FyLmlzaGF5L2ZhbmZpYy9hcHAvY29tcG9uZW50cy9NYWluUGFnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgY2xpZW50XCI7XG5cbmltcG9ydCBTZWN0aW9uc1ZpZXcgZnJvbSBcIkAvY29tcG9uZW50cy9TZWN0aW9uc1ZpZXdcIjtcbmltcG9ydCB7IFNldHRpbmdzTW9kYWwgfSBmcm9tIFwiQC9jb21wb25lbnRzL1NldHRpbmdzXCI7XG5pbXBvcnQgTG9hZGFibGVJY29uIGZyb20gXCJAL2NvbXBvbmVudHMvYmFzZS9Mb2FkYWJsZUljb25cIjtcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXCJAL2NvbXBvbmVudHMvdWkvYnV0dG9uXCI7XG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gXCJAL2NvbXBvbmVudHMvdWkvaW5wdXRcIjtcbmltcG9ydCAqIGFzIGNvbnN0cyBmcm9tIFwiQC9jb25zdHNcIjtcbmltcG9ydCB0eXBlIHsgRmFuZmljLCBTZWN0aW9uIH0gZnJvbSBcIkAvZGIvdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgYWN0aW9uIGFzIHVwZGF0ZUFjdGlvbiB9IGZyb20gXCJAL3JvdXRlcy9hcGkuY2hlY2stZm9yLXVwZGF0ZXNcIjtcbmltcG9ydCB0eXBlIHsgYWN0aW9uIGFzIGFkZEFjdGlvbiB9IGZyb20gXCJAL3JvdXRlcy9hcGkuc2VjdGlvbnMuJHNlY3Rpb25JZC5mYW5maWNzXCI7XG5pbXBvcnQgeyB1c2VGZXRjaGVyIH0gZnJvbSBcIkByZW1peC1ydW4vcmVhY3RcIjtcbmltcG9ydCB7IENsaXBib2FyZFBsdXMsIFJvdGF0ZUN3LCBTZWFyY2gsIFggfSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHRvYXN0IH0gZnJvbSBcInNvbm5lclwiO1xuXG5hc3luYyBmdW5jdGlvbiBNYWluUGFnZSh7XG5cdGZhbmZpY3MsXG5cdHNlY3Rpb25zLFxufTogeyBmYW5maWNzOiBGYW5maWNbXTsgc2VjdGlvbnM6IFNlY3Rpb25bXSB9KSB7XG5cdGNvbnN0IGFkZEZhbmZpY0ZldGNoZXIgPSB1c2VGZXRjaGVyPHR5cGVvZiBhZGRBY3Rpb24+KCk7XG5cdGNvbnN0IGFkZEZhbmZpY1N1Y2Nlc3NTdGF0ZSA9IGFkZEZhbmZpY0ZldGNoZXIuZGF0YT8uc3VjY2VzcztcblxuXHRjb25zdCBjaGVja1VwZGF0ZXNGZXRjaGVyID0gdXNlRmV0Y2hlcjx0eXBlb2YgdXBkYXRlQWN0aW9uPigpO1xuXHRjb25zdCBpc0NoZWNrVXBkYXRlc1N1Ym1pdHRpbmcgPSBjaGVja1VwZGF0ZXNGZXRjaGVyLnN0YXRlID09PSBcInN1Ym1pdHRpbmdcIjtcblx0Y29uc3QgY2hlY2tVcGRhdGVzU3VjY2Vzc1N0YXRlID0gY2hlY2tVcGRhdGVzRmV0Y2hlci5kYXRhPy5zdWNjZXNzO1xuXG5cdGNvbnN0IFtzZWFyY2hJbnB1dCwgc2V0U2VhcmNoSW5wdXRdID0gdXNlU3RhdGUoXCJcIik7XG5cblx0UmVhY3QudXNlRWZmZWN0KCgpID0+IHtcblx0XHRpZiAoY2hlY2tVcGRhdGVzU3VjY2Vzc1N0YXRlICYmICFjaGVja1VwZGF0ZXNGZXRjaGVyLmRhdGE/LmlzQ2FjaGUpIHtcblx0XHRcdGNoZWNrVXBkYXRlc0ZldGNoZXIuZGF0YT8uZGF0YS51cGRhdGVkRmFuZmljcy5tYXAoKGZhbmZpY1RpdGxlKSA9PlxuXHRcdFx0XHR0b2FzdC5zdWNjZXNzKGBGaWMgJHtmYW5maWNUaXRsZX0gdXBkYXRlZCBzdWNjZXNzZnVsbHlgKSxcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChjaGVja1VwZGF0ZXNGZXRjaGVyLmRhdGEgJiYgIWNoZWNrVXBkYXRlc0ZldGNoZXIuZGF0YS5zdWNjZXNzKSB7XG5cdFx0XHR0b2FzdC5lcnJvcihgQW4gZXJyb3Igb2NjdXJyZWQ6ICR7Y2hlY2tVcGRhdGVzRmV0Y2hlci5kYXRhLmRhdGF9YCk7XG5cdFx0fVxuXHR9LCBbY2hlY2tVcGRhdGVzRmV0Y2hlci5kYXRhLCBjaGVja1VwZGF0ZXNTdWNjZXNzU3RhdGVdKTtcblxuXHRSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGlmIChhZGRGYW5maWNTdWNjZXNzU3RhdGUgPT09IGZhbHNlKSB7XG5cdFx0XHRjb25zdCBtZXNzYWdlID0gYWRkRmFuZmljRmV0Y2hlci5kYXRhPy5tZXNzYWdlO1xuXHRcdFx0aWYgKG1lc3NhZ2U/LmluY2x1ZGVzKFwiZHVwbGljYXRlIGtleSB2YWx1ZSB2aW9sYXRlcyB1bmlxdWUgY29uc3RyYWludFwiKSkge1xuXHRcdFx0XHR0b2FzdC5lcnJvcihcIlRoaXMgZmljIGFscmVhZHkgZXhpc3RzIDopXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dG9hc3QuZXJyb3IoYEFuIGVycm9yIG9jY3VycmVkOiAke21lc3NhZ2V9YCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LCBbYWRkRmFuZmljU3VjY2Vzc1N0YXRlLCBhZGRGYW5maWNGZXRjaGVyLmRhdGFdKTtcblxuXHRjb25zdCBoYW5kbGVBZGRGYW5maWNGcm9tQ2xpcGJvYXJkID0gYXN5bmMgKCkgPT4ge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBjbGlwYm9hcmRUZXh0ID0gYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC5yZWFkVGV4dCgpO1xuXHRcdFx0aWYgKGNsaXBib2FyZFRleHQuc3RhcnRzV2l0aChgJHtjb25zdHMuQU8zX0xJTkt9L3dvcmtzL2ApKSB7XG5cdFx0XHRcdGFkZEZhbmZpY0ZldGNoZXIuc3VibWl0KFxuXHRcdFx0XHRcdHsgdXJsOiBjbGlwYm9hcmRUZXh0IH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bWV0aG9kOiBcIlBPU1RcIixcblx0XHRcdFx0XHRcdGFjdGlvbjogXCIvYXBpL3NlY3Rpb25zLzMvZmFuZmljc1wiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0b2FzdC5lcnJvcihcIkludmFsaWQgVVJMLiBQbGVhc2UgY29weSBhIHZhbGlkIEFPMyBmYW5maWMgVVJMXCIpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHJlYWQgZnJvbSBjbGlwYm9hcmQ6IFwiLCBlcnJvcik7XG5cdFx0XHR0b2FzdC5lcnJvcihcIkZhaWxlZCB0byByZWFkIGZyb20gY2xpcGJvYXJkXCIpO1xuXHRcdH1cblx0fTtcblxuXHRjb25zdCBoYW5kbGVDaGVja0ZvclVwZGF0ZXMgPSAoKSA9PiB7XG5cdFx0Y2hlY2tVcGRhdGVzRmV0Y2hlci5zdWJtaXQobnVsbCwge1xuXHRcdFx0bWV0aG9kOiBcIlBPU1RcIixcblx0XHRcdGFjdGlvbjogXCIvYXBpL2NoZWNrLWZvci11cGRhdGVzXCIsXG5cdFx0fSk7XG5cdH07XG5cblx0cmV0dXJuIChcblx0XHQ8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgaC1zY3JlZW5cIj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwic3RpY2t5IHRvcC0wIHotMjAgcC00IHNoYWRvdy1tZCBiZy1hY2NlbnRcIj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCBnYXAtMiBcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImp1c3RpZnktY2VudGVyIHJlbGF0aXZlXCI+XG5cdFx0XHRcdFx0XHQ8SW5wdXRcblx0XHRcdFx0XHRcdFx0dmFsdWU9e3NlYXJjaElucHV0fVxuXHRcdFx0XHRcdFx0XHRjbGFzc05hbWU9XCJwbC04XCJcblx0XHRcdFx0XHRcdFx0cGxhY2Vob2xkZXI9XCJTZWFyY2hcIlxuXHRcdFx0XHRcdFx0XHRvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRTZWFyY2hJbnB1dChldmVudC50YXJnZXQudmFsdWUpfVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHRcdDxTZWFyY2ggY2xhc3NOYW1lPVwicG9pbnRlci1ldmVudHMtbm9uZSBhYnNvbHV0ZSBsZWZ0LTIgdG9wLTEvMiBzaXplLTQgLXRyYW5zbGF0ZS15LTEvMiBzZWxlY3Qtbm9uZSBvcGFjaXR5LTUwXCIgLz5cblx0XHRcdFx0XHRcdHtzZWFyY2hJbnB1dCAmJiAoXG5cdFx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0XHRvbkNsaWNrPXsoKSA9PiBzZXRTZWFyY2hJbnB1dChcIlwiKX1cblx0XHRcdFx0XHRcdFx0XHR2YXJpYW50PVwiZ2hvc3RcIlxuXHRcdFx0XHRcdFx0XHRcdHNpemU9XCJpY29uXCJcblx0XHRcdFx0XHRcdFx0XHRjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC0xIHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiBcIlxuXHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0PFggLz5cblx0XHRcdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdFx0XHQpfVxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdHR5cGU9XCJidXR0b25cIlxuXHRcdFx0XHRcdFx0Y2xhc3NOYW1lPVwibWwtNCB3LWZpdFwiXG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtoYW5kbGVDaGVja0ZvclVwZGF0ZXN9XG5cdFx0XHRcdFx0XHRkaXNhYmxlZD17aXNDaGVja1VwZGF0ZXNTdWJtaXR0aW5nfVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdDxMb2FkYWJsZUljb25cblx0XHRcdFx0XHRcdFx0RGVmYXVsdEljb249e1JvdGF0ZUN3fVxuXHRcdFx0XHRcdFx0XHRzdGF0ZT17Y2hlY2tVcGRhdGVzRmV0Y2hlci5zdGF0ZX1cblx0XHRcdFx0XHRcdFx0c3VjY2Vzc1N0YXRlPXtjaGVja1VwZGF0ZXNTdWNjZXNzU3RhdGV9XG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdDxCdXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2hhbmRsZUFkZEZhbmZpY0Zyb21DbGlwYm9hcmR9PlxuXHRcdFx0XHRcdFx0PExvYWRhYmxlSWNvblxuXHRcdFx0XHRcdFx0XHREZWZhdWx0SWNvbj17Q2xpcGJvYXJkUGx1c31cblx0XHRcdFx0XHRcdFx0c3RhdGU9e2FkZEZhbmZpY0ZldGNoZXIuc3RhdGV9XG5cdFx0XHRcdFx0XHRcdHN1Y2Nlc3NTdGF0ZT17YWRkRmFuZmljU3VjY2Vzc1N0YXRlfVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8U2V0dGluZ3NNb2RhbCAvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJmbGV4LTEgb3ZlcmZsb3cteS1hdXRvXCI+XG5cdFx0XHRcdDxTZWN0aW9uc1ZpZXcgc2VhcmNoSW5wdXQ9e3NlYXJjaElucHV0fSAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1haW5QYWdlO1xuIl0sIm5hbWVzIjpbIlNlY3Rpb25zVmlldyIsIlNldHRpbmdzTW9kYWwiLCJMb2FkYWJsZUljb24iLCJCdXR0b24iLCJJbnB1dCIsImNvbnN0cyIsInVzZUZldGNoZXIiLCJDbGlwYm9hcmRQbHVzIiwiUm90YXRlQ3ciLCJTZWFyY2giLCJYIiwiUmVhY3QiLCJ1c2VTdGF0ZSIsInRvYXN0IiwiTWFpblBhZ2UiLCJmYW5maWNzIiwic2VjdGlvbnMiLCJhZGRGYW5maWNGZXRjaGVyIiwiY2hlY2tVcGRhdGVzRmV0Y2hlciIsImFkZEZhbmZpY1N1Y2Nlc3NTdGF0ZSIsImRhdGEiLCJzdWNjZXNzIiwiaXNDaGVja1VwZGF0ZXNTdWJtaXR0aW5nIiwic3RhdGUiLCJjaGVja1VwZGF0ZXNTdWNjZXNzU3RhdGUiLCJzZWFyY2hJbnB1dCIsInNldFNlYXJjaElucHV0IiwidXNlRWZmZWN0IiwiaXNDYWNoZSIsInVwZGF0ZWRGYW5maWNzIiwibWFwIiwiZmFuZmljVGl0bGUiLCJlcnJvciIsIm1lc3NhZ2UiLCJpbmNsdWRlcyIsImhhbmRsZUFkZEZhbmZpY0Zyb21DbGlwYm9hcmQiLCJjbGlwYm9hcmRUZXh0IiwibmF2aWdhdG9yIiwiY2xpcGJvYXJkIiwicmVhZFRleHQiLCJzdGFydHNXaXRoIiwiQU8zX0xJTksiLCJzdWJtaXQiLCJ1cmwiLCJtZXRob2QiLCJhY3Rpb24iLCJjb25zb2xlIiwiaGFuZGxlQ2hlY2tGb3JVcGRhdGVzIiwiZGl2IiwiY2xhc3NOYW1lIiwidmFsdWUiLCJwbGFjZWhvbGRlciIsIm9uQ2hhbmdlIiwiZXZlbnQiLCJ0YXJnZXQiLCJvbkNsaWNrIiwidmFyaWFudCIsInNpemUiLCJ0eXBlIiwiZGlzYWJsZWQiLCJEZWZhdWx0SWNvbiIsInN1Y2Nlc3NTdGF0ZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/components/MainPage.tsx\n"));

/***/ })

});