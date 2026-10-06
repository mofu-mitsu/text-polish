const $=s=>document.querySelector(s),input=$("#textInput"),targetInput=$("#targetCount"),message=$("#message");
const URL_RE=/(?:https?:\/\/|www\.)[^\s<>"'「」『』]+/gi;
const JAPANESE_RE=/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff66-\uff9f]/u;
const ALPHA_RE=/[A-Za-z]/,NUMBER_RE=/[0-9０-９]/,SPACE_RE=/\s/u;
const PUNCTUATION_MAP={",":"、",".":"。","!":"！","?":"？",":":"：",";":"；"};
function chars(t){return Array.from(t)}
function countEmoji(t){if(!t)return 0;if(typeof Intl!=="undefined"&&Intl.Segmenter){const s=new Intl.Segmenter(undefined,{granularity:"grapheme"});let n=0;for(const{segment}of s.segment(t))if(/\p{Extended_Pictographic}/u.test(segment))n++;return n}return(t.match(/\p{Extended_Pictographic}/gu)||[]).length}
function getStats(text){const list=chars(text),withoutUrls=text.replace(URL_RE,""),urlExcluded=chars(withoutUrls);let japanese=0,alpha=0,number=0,spaces=0,lineBreaks=0,symbols=0;for(const c of list){if(c==="\n"||c==="\r")lineBreaks++;if(SPACE_RE.test(c))spaces++;if(JAPANESE_RE.test(c))japanese++;else if(ALPHA_RE.test(c))alpha++;else if(NUMBER_RE.test(c))number++;else if(!SPACE_RE.test(c)&&c!=="\n"&&c!=="\r")symbols++}return{characters:list.length,urlExcluded:urlExcluded.length,lineBreaks,spaces,japanese,alpha,number,symbols,emoji:countEmoji(text),lines:text?text.split(/\r?\n/).length:1}}
function render(){const text=input.value,stats=getStats(text),target=Math.max(0,Number(targetInput.value)||0);$("#charCount").textContent=stats.characters.toLocaleString();$("#heroCount").textContent=stats.characters.toLocaleString();$("#urlExcludedCount").textContent=stats.urlExcluded.toLocaleString();$("#lineBreakCount").textContent=stats.lineBreaks.toLocaleString();$("#spaceCount").textContent=stats.spaces.toLocaleString();$("#japaneseCount").textContent=stats.japanese.toLocaleString();$("#alphaCount").textContent=stats.alpha.toLocaleString();$("#numberCount").textContent=stats.number.toLocaleString();$("#symbolCount").textContent=stats.symbols.toLocaleString();$("#emojiCount").textContent=stats.emoji.toLocaleString();$("#lineInfo").textContent=stats.lines.toLocaleString()+"行";$("#wordInfo").textContent=stats.characters.toLocaleString()+"文字";const percent=target>0?Math.min(100,stats.characters/target*100):0;$("#progressBar").style.width=percent+"%";$("#progressPercent").textContent=Math.round(percent)+"%";$("#progressText").textContent=target===0?"目標文字数を設定してください":stats.characters<target?"あと "+(target-stats.characters).toLocaleString()+" 文字":stats.characters===target?"ぴったり！":target.toLocaleString()+"文字を "+(stats.characters-target).toLocaleString()+"文字超過"}
function setText(t,n){input.value=t;render();if(n)showMessage(n);input.focus()}
function showMessage(t){message.textContent=t;clearTimeout(showMessage.timer);showMessage.timer=setTimeout(()=>message.textContent="",2400)}
function normalizeSpaces(t){return t.replace(/[ \t\u3000]+/g," ").replace(/^[ ]+|[ ]+$/gm,"")}
function normalizeLineBreaks(t){return t.replace(/\r\n?/g,"\n").replace(/\n{3,}/g,"\n\n").trim()}
function normalizeWidth(t){return t.replace(/[！-～]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0)).replace(/　/g," ")}
function normalizePunctuation(t){return t.replace(/[,.!?:;]/g,c=>PUNCTUATION_MAP[c]||c)}
function normalizeQuotes(t){let r=t.replace(/[“”]/g,c=>c==="“"?"「":"」").replace(/「{2}/g,"「").replace(/」{2}/g,"」"),open=true;return r.replace(/"/g,()=>open?"「":"」").replace(/(?<![\p{L}\p{N}])'([^']+)'/gu,"「$1」")}
function formatBullets(t){return t.replace(/^[ \t]*[-*+・]+[ \t]*/gm,"・").replace(/^[ \t]*[•●○][ \t]*/gm,"・")}
const actions={spaces:{label:"余分な空白を整理しました",fn:normalizeSpaces},linebreaks:{label:"連続した改行を整理しました",fn:normalizeLineBreaks},width:{label:"全角・半角を整理しました",fn:normalizeWidth},punctuation:{label:"句読点を統一しました",fn:normalizePunctuation},quotes:{label:"括弧・引用符を整理しました",fn:normalizeQuotes},trim:{label:"文章の前後をトリミングしました",fn:t=>t.trim()}};
document.querySelectorAll(".tool-button").forEach(b=>b.addEventListener("click",()=>{const a=actions[b.dataset.action];if(a)setText(a.fn(input.value),a.label)}));
input.addEventListener("input",render);targetInput.addEventListener("input",render);
$("#copyButton").addEventListener("click",async()=>{if(!input.value)return showMessage("コピーする文章がありません");try{await navigator.clipboard.writeText(input.value);showMessage("文章をクリップボードにコピーしました")}catch{input.select();document.execCommand("copy");input.setSelectionRange(input.value.length,input.value.length);showMessage("文章をコピーしました")}});
$("#extractUrls").addEventListener("click",()=>{const urls=input.value.match(URL_RE)||[];if(!urls.length)return showMessage("URLは見つかりませんでした");setText(urls.join("\n"),urls.length+"件のURLを抽出しました")});
$("#formatBullets").addEventListener("click",()=>setText(formatBullets(input.value),"箇条書きを整えました"));
$("#clearButton").addEventListener("click",()=>setText("","入力内容をクリアしました"));
$("#sampleButton").addEventListener("click",()=>setText("Text Polishのサンプル文章です。  余分な空白や\n\n\n連続した改行を整理して、文字数も確認できます。\nhttps://example.com/sample","サンプル文章を入力しました"));
render();