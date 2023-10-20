
//// below are utils
jQuery.fn.extend({
    refreshSuggest: function(selectedCallback, suggestLength = 10, delayMs = 3000) {
        let curVal = $(this).val();
        let suggestDiv = this.prev("div[name='_suggest']");
        let that = this;
        if (curVal && suggestDiv.length > 0) {
            curVal = curVal.toLowerCase();
            let options = suggestDiv.attr("options");
            if (options) {
                let width = Math.round($(this).width());
                let optionsHtml = "";
                let optionList = options.split(",");
                let total = optionList.length;
                let matchedCount = 0;
                if (' ' === curVal) {// if blank, then show some without filter
                    optionList = optionList.sort();
                } else {
                    optionList = optionList.filter(ele => ele.toLowerCase().indexOf(curVal) > -1).sort();
                }
                
                for (let option of optionList) {
                    optionsHtml += `<li seq='${matchedCount}'><input name='_suggest' val='${option}' value='${option}' style='width:${width}px' readonly/></li>`;
                    if (++matchedCount > suggestLength) {
                        break;
                    }
                };
                
                suggestDiv.find("ol[name='_suggest']").html(optionsHtml);
                if (0 < matchedCount) {
                    suggestDiv.find("span[name='_nums']").html(`<span name='_cur'>0</span>/<span name='_total'>${optionList.length}/${total}</span>`);
                }
                

                function delayFadeout() {//auto fadeout when no action on suggest div
                    let prevTimeoutId = suggestDiv.attr("timeoutId");
                    if (prevTimeoutId) {
                        clearTimeout(prevTimeoutId);
                    }
                    let timeoutId = setTimeout(function(){
                        suggestDiv.find("ol").html("");
                        suggestDiv.find("span[name='_nums']").html("");
                    }, delayMs);
                    suggestDiv.attr("timeoutId", timeoutId);
                };
                delayFadeout();

                // click event
                function clickEvent(event) {
                    let cur = $(event.target);
                    $(that).val(cur.val());
                    suggestDiv.find("ol").html("");
                    suggestDiv.find("span[name='_nums']").html("");
                    $(that).focus();
                    if (selectedCallback) {
                        selectedCallback();
                    }
                }
                // keyup actions
                function keyEvent(event) {
                    const key = event.keyCode;
                    let cur = $(event.target);
                    let seq = parseInt(cur.parent().attr("seq"));
                    if (40 === key || 38 === key) {//down or up
                        let now = null;
                        if (40 === key) {//down array
                            let lastSeq = parseInt(cur.parent().parent().find("li").last().attr("seq"));
                            while (lastSeq - seq <= suggestLength / 4 && lastSeq + 1 < optionList.length) {
                                cur.parent().parent().find("li").first().remove();
                                let option = optionList[++lastSeq];
                                let suggest = $(`<input name='_suggest' val='${option}' value='${option}' style='width:${width}px' readonly/>`);
                                suggest.keyup(keyEvent);
                                suggest.click(clickEvent);
                                let li = $(`<li seq='${lastSeq}'></li>`);
                                li.append(suggest);
                                cur.parent().parent().append(li);
                                lastSeq++;
                            }
                            now = cur.parent().next().find("input");
                            if (0 !== now.length) {
                                cur.css("backgroundColor", "");
                                now.css('backgroundColor', 'lightgray');
                                suggestDiv.find("span[name='_cur']").html(seq + 1);
                                
                            }
                        } else if (38 === key) {//up array
                            now = cur.parent().prev().find("input");
                            if (0 !== now.length) {
                                cur.css("backgroundColor", "");
                                now.css('backgroundColor', 'lightgray');
                                suggestDiv.find("span[name='_cur']").html(seq - 1);
                                let firstSeq = parseInt(cur.parent().parent().find("li").first().attr("seq"));
                                if (seq - firstSeq <= suggestLength / 4 && firstSeq - 1>= 0) {
                                    cur.parent().parent().find("li").last().remove();
                                    let option = optionList[--firstSeq];
                                    let suggest = $(`<input name='_suggest' val='${option}' value='${option}' style='width:${width}px' readonly/>`);
                                    suggest.keyup(keyEvent);
                                    suggest.click(clickEvent);
                                    let li = $(`<li seq='${firstSeq}'></li>`);
                                    li.append(suggest);
                                    cur.parent().parent().prepend(li);
                                }
                            }
                            if (0 === seq) {
                                cur.css("backgroundColor", "");
                                $(that).focus().select();
                            }
                        }
                        now.focus();
                        delayFadeout();
                    } else if (13 === key) {//carriage ret
                        $(that).val(cur.val());
                        suggestDiv.find("ol").html("");
                        suggestDiv.find("span[name='_nums']").html("");
                        $(that).focus();
                        if (selectedCallback) {
                            selectedCallback();
                        }
                    }
                }
                suggestDiv.find("input[name='_suggest']").keyup(keyEvent);

                // click action
                suggestDiv.find("input[name='_suggest']").click(clickEvent);  
            }
        }
    },
    addSuggest: function(options, selectedCallback, suggestLength = 10, delayMs = 3000) {
        let suggestDiv = this.prev("div[name='_suggest']");
        if (suggestDiv.length < 1) {
            suggestDiv = $(`<div name='_suggest' style='position:relative;'>
                                <div style='z-index:100;position:absolute;top:2em;'>
                                    <ol name='_suggest' style='padding-left:1em;list-style:none;margin-bottom:0;'></ol>
                                    <span name='_nums' style='padding-left:1em;font-size: x-small;float:right;'></span>
                                </div>
                            </div>` );
            suggestDiv.insertBefore(this);

            this.keyup(event => {
                const key = event.keyCode;
                let suggestDiv = this.prev("div[name='_suggest']");
                if (13 === key) {//carriage ret
                    if (suggestDiv.find("input").length < 1) {
                        return;
                    }
                    let first = suggestDiv.find("input");
                    if (first) {
                        this.val(first.val());
                        if (selectedCallback) {
                            selectedCallback();
                        }
                    }
                    suggestDiv.find("ol").html("");
                } else if (40 === key) {// down array
                    if (suggestDiv.find("input").length < 1) {
                        return;
                    }
                    let first = suggestDiv.find("input").first();
                    if (first) {
                        first.css('backgroundColor', 'lightgray');
                        first.focus();
                    }
                } else if (38 === key) {// up array
                    if (suggestDiv.find("input").length < 1) {
                        return;
                    }
                    let last = suggestDiv.find("input").last();
                    if (last) {
                        last.css('backgroundColor', 'lightgray');
                        last.focus();
                        let seq = parseInt(last.parent().attr("seq"));
                        suggestDiv.find("span[name='_cur']").html(seq);
                    }
                } else {
                    this.refreshSuggest(selectedCallback, suggestLength, delayMs);
                }
            });
        }
        suggestDiv.attr("options", options);

        this.refreshSuggest(selectedCallback, suggestLength, delayMs);
    }, 
    updateOptions(options, selectedCallback, suggestLength = 10, delayMs = 3000) {
        let suggestDiv = this.prev("div[name='_suggest']");
        if(suggestDiv.length > 0) {
            suggestDiv.attr("options", options);
        } else {
            addSuggest(options, selectedCallback, suggestLength, delayMs);
        }
    }
});
