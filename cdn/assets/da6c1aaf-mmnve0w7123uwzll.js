import{n as e,s as t}from"./f025431a-ehagpvg3m4e1cduv.js";import{BZ as n,DX as r,Ec as i,Hc as a,L_ as o,Lc as s,Mc as c,Oc as l,R_ as u,U$ as d,Wc as f,ac as p,bc as m,cy as h,eL as g,f1 as _,fc as v,gC as y,iL as b,jc as x,mC as S,nQ as C,sy as w,tQ as T,xc as E}from"./4813494d-l4t5njeos7wg6tki.js";import{An as D,Dn as O,En as k,Tn as A,Xt as j,_n as M,fn as ee,gn as N,hn as te,jn as ne,vn as P,wn as F,yn as I}from"./2340486e-ntgsg4a2ljrzv0ij.js";import{CI as re,Uj as ie,Wj as ae,X7 as oe,Xj as se,Z7 as ce,bs as le,dTt as ue,gs as de,hs as fe,uTt as pe,wI as me,xs as he}from"./conversation-small-ncs0r144rwzxohlv.js";import{At as ge,T_ as _e,b_ as ve,jt as ye,n as be,t as xe,w_ as Se,x_ as Ce}from"./30901919-ruy0fjurmbd2aip7.js";import{$f as we,Ct as Te,Dt as Ee,Gl as De,Hl as L,Ip as Oe,Kl as ke,Ot as Ae,Pp as je,Qf as Me,Vl as Ne,Xn as Pe,Zn as Fe,_t as Ie,ao as Le,kt as Re,lo as ze,oo as Be,ot as Ve,ql as R,rt as He,st as z,uo as Ue,vt as We,wt as Ge}from"./8b34dbc2-id5ac50bvwz9mjj3.js";var B,V,H,U,W,G,K,Ke,qe,Je=e((()=>{ne(),A(),O(),B=new WeakMap,V=new WeakMap,H=new WeakMap,U=new WeakMap,W=new WeakMap,G=new WeakMap,K=new WeakMap,Ke=class{constructor(e,t){D(this,B,void 0),D(this,V,void 0),D(this,H,void 0),D(this,U,[]),D(this,W,{}),D(this,G,void 0),D(this,K,void 0),F(H,this,e);let n=e.getUniformBlockIndex(t,qe._),r=e.getActiveUniformBlockParameter(t,n,e.UNIFORM_BLOCK_DATA_SIZE);F(G,this,e.createBuffer()),e.bindBuffer(e.UNIFORM_BUFFER,k(G,this)),e.bufferData(e.UNIFORM_BUFFER,r,e.DYNAMIC_DRAW),e.bindBufferBase(e.UNIFORM_BUFFER,0,k(G,this)),e.uniformBlockBinding(t,n,0);let i=e.getActiveUniformBlockParameter(t,n,e.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);F(U,this,[]),F(W,this,{});for(let n=0;n<i.length;n++){let r=i[n];if(r==null)continue;let a=e.getActiveUniform(t,r);if(!a)throw Error(`No uniformInfo for index `+r);let o=a.name;o=o.replace(/\[0\]$/,``);let s=e.getActiveUniforms(t,[r],e.UNIFORM_OFFSET),c=Array.isArray(s)&&s.length>0?s[0]:0;k(U,this).push(o),k(W,this)[o]=c}F(K,this,new ArrayBuffer(r)),F(B,this,new Float32Array(k(K,this))),F(V,this,new Int32Array(k(K,this)))}setVariablesAndRender(e){for(let t of k(U,this)){let[,n]=t.split(`.`),r=k(W,this)[t]/4,i=e[n];typeof i==`number`?k(B,this)[r]=i:typeof i==`boolean`?k(V,this)[r]=+!!i:Array.isArray(i)&&k(B,this).set(i,r)}k(H,this).bindBuffer(k(H,this).UNIFORM_BUFFER,k(G,this)),k(H,this).bufferSubData(k(H,this).UNIFORM_BUFFER,0,k(K,this)),k(H,this).drawArrays(k(H,this).TRIANGLE_STRIP,0,6)}},qe={_:`BlorbUniformsObject`}})),Ye,Xe=e((()=>{Ye=`#version 300 es
#define E (2.71828182846)
#define pi (3.14159265358979323844)

precision highp float;

struct ColoredSDF {
  float distance;
  vec4 color;
};

struct SDFArgs {
  vec2 st;
  float amount;
  float duration;
  float time;
  float mainRadius;
};

/* ----------------------- Utilities actually used ----------------------- */

float scaled(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), float(0), float(1));
}

float spring(float t, float d) {
  return 1.0 - exp(-E * 2.0 * t) * cos((1.0 - d) * 115.0 * t);
}

float bounce(float t, float d) {
  return -sin(pi * (1.0 - d) * t) * (1.0 - t) * exp(-E * 2.0 * t) * t * 10.0;
}

float opSmoothUnion(float d1, float d2, float k) {
  if (k <= 0.0) k = 0.000001;
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
  r.xy = p.x > 0.0 ? r.xy : r.zw;
  r.x = p.y > 0.0 ? r.x : r.y;
  vec2 q = abs(p) - b + r.x;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}

/* --------------------------- Active states ----------------------------- */

ColoredSDF applyIdleState(
  ColoredSDF sdf,
  SDFArgs args,
  bool isWhiteForeground
) {
  float midRadius = 0.12;
  float maxRadius = 0.3;
  float t1 = 1.0;
  float gamma = 3.0;
  float omega = pi / 2.0;

  float k = exp(-gamma) * omega;

  float radius;
  if (args.time <= t1) {
    float t_prime = args.time / t1;
    float springValue = 1.0 - exp(-gamma * t_prime) * cos(omega * t_prime);
    radius = midRadius * springValue;
  } else {
    float adjustedTime = args.time - t1;
    radius =
      midRadius + (maxRadius - midRadius) * (1.0 - exp(-k * adjustedTime));
  }

  float distance = length(args.st) - radius;
  sdf.distance = mix(sdf.distance, distance, args.amount);

  
  float alpha = sin(pi / 0.7 * args.time) * 0.3 + 0.7;
  vec4 color = vec4(isWhiteForeground ? vec3(1.0) : vec3(0.0), alpha);
  sdf.color = mix(sdf.color, color, args.amount);

  return sdf;
}

ColoredSDF applySpeakState(
  ColoredSDF sdf,
  SDFArgs args,
  vec4 avgMag,
  float silenceAmount,
  float silenceDuration
) {
  float d = 1000.0;
  const int barCount = 4;

  float totalSpan = args.mainRadius * 1.9;
  float slotWidth = totalSpan / float(barCount);
  float gapRatio = clamp(0.35, 0.0, 0.9);
  float baseBarHalfWidth = slotWidth * (1.0 - gapRatio) * 0.5;

  for (int i = 0; i < barCount; i++) {
    float f = (float(i) + 0.5) / float(barCount);

    float w = baseBarHalfWidth;
    float h = w;

    float wave = sin(f * pi * 0.8 + args.time) * 0.5 + 0.5;
    float entryAnimation = spring(
      scaled(0.1 + wave * 0.4, 1.0 + wave * 0.4, args.duration),
      0.98
    );

    vec2 pos = vec2(f - 0.5, 0.0) * totalSpan;
    pos.y = 0.25 * (1.0 - entryAnimation);

    
    if (silenceAmount > 0.0) {
      float bounceStagger = f / 5.0;
      float bounceDelay = 0.6;
      float bounceTimer = scaled(
        bounceDelay,
        bounceDelay + 1.0,
        fract((silenceDuration + bounceStagger) / 2.0) * 2.0
      );
      pos.y +=
        bounce(bounceTimer, 6.0) *
        w *
        0.25 *
        silenceAmount *
        pow(entryAnimation, 4.0) *
        pow(args.amount, 4.0);
    }

    
    h += avgMag[i] * (0.1 + (1.0 - abs(f - 0.5) * 2.0) * 0.1);

    float dd = sdRoundedBox(args.st - pos, vec2(w, h), vec4(w));
    d = opSmoothUnion(d, dd, 0.2 * (1.0 - args.amount));
  }

  sdf.distance = mix(sdf.distance, d, args.amount);
  sdf.color.a = 1.0;
  return sdf;
}

/* ------------------------------ I/O & UBO ------------------------------ */

in vec2 out_uv;
out vec4 fragColor;

layout(std140) uniform BlorbUniformsObject {
  float time;
  float speakTimestamp;
  vec4 avgMag;
  vec2 viewport;
  float screenScaleFactor;
  float silenceAmount;
  float silenceTimestamp;
  bool isWhiteForeground;
} ubo; 

/* -------------------------------- main --------------------------------- */

void main() {
  vec2 st = out_uv - 0.5;
  float viewRatio = ubo.viewport.y / ubo.viewport.x;
  st.y *= viewRatio;

  ColoredSDF sdf;
  sdf.distance = 1000.0;
  sdf.color = vec4(1.0);

  SDFArgs args;
  args.st = st;
  args.time = ubo.time;
  args.mainRadius = 0.49;
  args.amount = 1.0;
  args.duration = ubo.time - ubo.speakTimestamp;

  
  SDFArgs idleArgs = args;
  idleArgs.amount = 1.0;
  sdf = applyIdleState(sdf, idleArgs, ubo.isWhiteForeground);

  float silenceDuration = ubo.time - ubo.silenceTimestamp;
  sdf = applySpeakState(
    sdf,
    args,
    ubo.avgMag,
    ubo.silenceAmount,
    silenceDuration
  );

  float clampingTolerance = 0.0075 / max(ubo.screenScaleFactor, 0.0001);
  float clampedShape = smoothstep(clampingTolerance, 0.0, sdf.distance);
  float alpha = sdf.color.a * clampedShape;
  fragColor = vec4(sdf.color.rgb * alpha, alpha);
}`})),Ze,Qe=e((()=>{Ze=`#version 300 es

out vec4 out_position;
out vec2 out_uv;

const vec4 blitFullscreenTrianglePositions[6] = vec4[](
  vec4(-1.0, -1.0, 0.0, 1.0),
  vec4(3.0, -1.0, 0.0, 1.0),
  vec4(-1.0, 3.0, 0.0, 1.0),
  vec4(-1.0, -1.0, 0.0, 1.0),
  vec4(3.0, -1.0, 0.0, 1.0),
  vec4(-1.0, 3.0, 0.0, 1.0)
);

void main() {
  out_position = blitFullscreenTrianglePositions[gl_VertexID];
  out_uv = out_position.xy * 0.5 + 0.5;
  out_uv.y = 1.0 - out_uv.y;
  gl_Position = out_position;
}`}));function $e({className:e,staticConfig:t,onDynamicConfigSetterReady:n,onRenderComplete:r}){"use no forget";let i=(0,q.useRef)(performance.now()/1e3),a=(0,q.useRef)({viewport:tt,time:i.current}).current,o=(0,q.useRef)(void 0),s=(0,q.useRef)({...a,...t,speakTimestamp:0,avgMag:[0,0,0,0],silenceAmount:0,silenceTimestamp:0}),c=(0,q.useCallback)(e=>{s.current={...a,...t,...e},o.current=e},[a,t]);return(0,q.useEffect)(()=>{o.current&&(s.current={...a,...t,...o.current})},[t,a]),(0,q.useEffect)(()=>{n(c)},[n,c]),(0,q.useEffect)(()=>{let e=setInterval(()=>{a.time=performance.now()/1e3},le);return()=>clearInterval(e)},[a]),(0,et.jsx)(Te,{className:T(`flex items-center justify-center`,e),variablesRef:s,onViewportUpdate:e=>{a.viewport=[e.width,e.height]},onGlAvailable:void 0,onCanvasSizeUpdate:void 0,onRenderComplete:r,scale:1,GLUniformsSetter:Ke,vert:Ze,frag:Ye})}var q,et,tt,nt=e((()=>{Ge(),he(),C(),q=t(I()),Je(),Xe(),Qe(),et=P(),tt=[300,300]}));function rt(e){return e.source===re.Microphone}function it(e){return e.origin===`local`}function at(e){return e*ut}function ot(){Ae()||Re()}var st,ct,lt,ut,dt,ft,pt=e((()=>{st=j(),fe(),r(),me(),Ee(),Ue(),ct=t(I()),nt(),lt=P(),ut=1.4,dt={bands:4,loPass:0,hiPass:400},ft=e=>{"use forget";let t=(0,st.c)(13),{className:r}=e,[i,a]=(0,ct.useState)(void 0),o;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(o=ze(),t[0]=o):o=t[0];let s=n(o.tracks$),c;t[1]===s?c=t[2]:(c=s.filter(rt).find(it),t[1]=s,t[2]=c);let l=de(c?.track,dt),u;t[3]===l?u=t[4]:(u=l.map(at),t[3]=l,t[4]=u);let d=u,f=ot,p,m;t[5]!==d||t[6]!==i?(p=()=>{i&&i({speakTimestamp:0,avgMag:d,silenceAmount:0,silenceTimestamp:0})},m=[d,i],t[5]=d,t[6]=i,t[7]=p,t[8]=m):(p=t[7],m=t[8]),(0,ct.useEffect)(p,m);let h;t[9]===Symbol.for(`react.memo_cache_sentinel`)?(h={screenScaleFactor:window.devicePixelRatio,isWhiteForeground:!0},t[9]=h):h=t[9];let g=h,_;t[10]===Symbol.for(`react.memo_cache_sentinel`)?(_=e=>{a(()=>e)},t[10]=_):_=t[10];let v=_,y;return t[11]===r?y=t[12]:(y=(0,lt.jsx)($e,{className:r,staticConfig:g,onDynamicConfigSetterReady:v,onRenderComplete:f}),t[11]=r,t[12]=y),y}})),mt,ht,gt=e((()=>{mt={ON:{colorClass:`!bg-black/5 !hover:bg-black/10 !active:bg-black/20 !dark:bg-[rgba(255,255,255,0.04)] !dark:hover:bg-white/5 !dark:active:bg-white/10`,sizeClass:`!h-9 !w-9 !min-h-9 touch:!min-h-9`,iconColorClass:void 0},OFF:{colorClass:`bg-red-500! hover:bg-red-400! active:bg-red-600! dark:bg-red-500! dark:hover:bg-red-400! dark:active:bg-red-600!`,sizeClass:`!h-9 !w-9 !min-h-9 touch:!min-h-9`,iconColorClass:`text-white`}},ht={ON:{colorClass:`bg-gray-900 hover:bg-gray-800 active:bg-gray-700`,sizeClass:`!h-9 !w-9 !min-h-9 touch:!min-h-9`,iconColorClass:`text-token-main-surface-primary hover:text-token-text-inverted`},OFF:{colorClass:`bg-black/5 hover:bg-black/10 active:bg-black/20 dark:bg-[rgba(255,255,255,0.04)] dark:hover:bg-white/5 dark:active:bg-white/10`,sizeClass:`!h-9 !w-9 !min-h-9 touch:!min-h-9`,iconColorClass:`hover:text-token-text-inverted`}}}));function _t(e){return e.server.connectionState===s.Connected}function vt(e){return e.server.remoteState===a.Listening||e.server.remoteState===a.Speaking}function yt(){return ie()}var J,bt,Y,X,xt,St,Ct,wt,Tt,Et,Z,Dt=e((()=>{J=j(),u(),xe(),pt(),g(),r(),h(),We(),z(),f(),L(),C(),bt=t(I()),N(),ae(),p(),gt(),i(),Y=P(),X={buttonLayout:`rounded-full overflow-hidden h-9 px-3`,buttonContents:`flex flex-row items-center justify-center gap-2`,buttonColors:`hover:opacity-80 font-semibold transition-colors transition-width duration-500 ease-in-out`,loadingColor:`bg-token-icon-primary text-token-text-inverted px-0`,loadedColor:`bg-token-bg-accent-static text-token-text-inverted-static`},xt=`relative overflow-visible before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:content-[''] before:shadow-[0_0_18px_6px_rgba(250,226,113,0.6)] before:opacity-90 before:animate-[pulse_2.4s_ease-in-out_infinite]`,St=`bg-[#fae271] text-[#a96e25] hover:bg-[#f6dc63] active:bg-[#f0d35a]`,Ct=e=>{"use forget";let t=(0,J.c)(7),{className:n,Icon:r}=e,i;t[0]===n?i=t[1]:(i=T(n,`relative`),t[0]=n,t[1]=i);let a;t[2]===r?a=t[3]:(a=(0,Y.jsx)(r,{className:`absolute start-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2`}),t[2]=r,t[3]=a);let o;return t[4]!==i||t[5]!==a?(o=(0,Y.jsx)(`div`,{className:i,children:a}),t[4]=i,t[5]=a,t[6]=o):o=t[6],o},wt=()=>{"use forget";let e=(0,J.c)(5),[t,n]=(0,bt.useState)(!0),r=R(_t),i=R(vt),a,o;return e[0]!==r||e[1]!==i||e[2]!==t?(a=()=>{r&&i&&t?n(!1):r||n(!0)},o=[r,i,t],e[0]=r,e[1]=i,e[2]=t,e[3]=a,e[4]=o):(a=e[3],o=e[4]),(0,bt.useEffect)(a,o),t},Tt=e=>{"use forget";let t=(0,J.c)(15),{onClick:n,hasExceededRateLimit:r,isEndingVoiceSession:i,isLoading:a}=e,s=M(),c,l;i?(c=Z.endingVoiceSessionLabel,l=w):a&&!r?(c=Z.cancelLoadingAriaLabel,l=o):(c=Z.endVoiceAriaLabel,l=o);let u;t[0]!==c||t[1]!==s?(u=s.formatMessage(c),t[0]=c,t[1]=s,t[2]=u):u=t[2];let d=l,f=i&&`pointer-events-none`,p;t[3]===f?p=t[4]:(p=T(`keyboard-focused:focus-ring`,f),t[3]=f,t[4]=p);let m;t[5]!==c||t[6]!==s?(m=s.formatMessage(c),t[5]=c,t[6]=s,t[7]=m):m=t[7];let h;return t[8]!==l||t[9]!==i||t[10]!==n||t[11]!==u||t[12]!==p||t[13]!==m?(h=(0,Y.jsx)(He,{"aria-label":u,onClick:n,icon:d,iconSize:`icon-md`,buttonSize:mt.ON.sizeClass,className:p,disabled:i,iconColor:`text-token-text-inverted`,tooltipPrimaryLabel:m}),t[8]=l,t[9]=i,t[10]=n,t[11]=u,t[12]=p,t[13]=m,t[14]=h):h=t[14],h},Et=e=>{"use forget";let t=(0,J.c)(27),{onClick:r}=e,i=wt(),a=M(),o=m(),s=n(yt)?.id!=null,[c,u]=(0,bt.useState)(!1),d=l();if(n(v)){let e;return t[0]!==s||t[1]!==o||t[2]!==i||t[3]!==r?(e=(0,Y.jsx)(Tt,{onClick:r,hasExceededRateLimit:s,isEndingVoiceSession:o,isLoading:i}),t[0]=s,t[1]=o,t[2]=i,t[3]=r,t[4]=e):e=t[4],e}let f,p,h;o?(f=w,p=Z.endingVoiceSessionLabel,h=Z.endingVoiceSessionLabel):i&&!s?(f=c?be:w,p=Z.cancelLoadingAriaLabel,h=Z.cancelLoadingButtonLabel):(f=d&&b()?Ie:ft,p=Z.endVoiceAriaLabel,h=Z.endVoiceButtonLabel);let g=i||o,_,y,x,S;t[5]===Symbol.for(`react.memo_cache_sentinel`)?(_=()=>u(!0),y=()=>u(!1),x=()=>u(!0),S=()=>u(!1),t[5]=_,t[6]=y,t[7]=x,t[8]=S):(_=t[5],y=t[6],x=t[7],S=t[8]);let C;t[9]!==p||t[10]!==a?(C=a.formatMessage(p),t[9]=p,t[10]=a,t[11]=C):C=t[11];let E=g&&X.loadingColor,D=!g&&(d?St:X.loadedColor),O=!g&&d&&xt,k;t[12]!==E||t[13]!==D||t[14]!==O?(k=T(X.buttonLayout,X.buttonContents,X.buttonColors,E,D,O),t[12]=E,t[13]=D,t[14]=O,t[15]=k):k=t[15];let A;t[16]===f?A=t[17]:(A=(0,Y.jsx)(Ct,{Icon:f,className:`h-3 w-3`}),t[16]=f,t[17]=A);let j;t[18]===h?j=t[19]:(j=(0,Y.jsx)(ee,{...h}),t[18]=h,t[19]=j);let N;return t[20]!==o||t[21]!==r||t[22]!==A||t[23]!==j||t[24]!==C||t[25]!==k?(N=(0,Y.jsxs)(`button`,{onMouseOver:_,onMouseOut:y,onFocus:x,onBlur:S,"aria-label":C,type:`button`,className:k,onClick:r,disabled:o,children:[A,j]}),t[20]=o,t[21]=r,t[22]=A,t[23]=j,t[24]=C,t[25]=k,t[26]=N):N=t[26],N},Z=te({endVoiceButtonLabel:{id:`integratedux.endVoiceMode`,defaultMessage:`End`},cancelLoadingButtonLabel:{id:`integratedux.cancelLoading`,defaultMessage:`Cancel`},endVoiceAriaLabel:{id:`integratedux.endVoiceAriaLabel`,defaultMessage:`End Voice`},cancelLoadingAriaLabel:{id:`integratedux.cancelLoadingAria`,defaultMessage:`Cancel loading`},endingVoiceSessionLabel:{id:`integratedux.endingVoiceSession`,defaultMessage:`Ending…`}})})),Ot,kt,At,jt,Mt,Nt,Pt=e((()=>{Ot=j(),Se(),z(),C(),kt=t(I()),N(),gt(),At=P(),jt=1e3,Mt=e=>{"use forget";let t=(0,Ot.c)(19),{disabled:n,onClick:r,microphoneLabel:i,microphoneActive:a,microphoneForceMuted:o}=e,[s,c]=(0,kt.useState)(!1),l,u;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(l=()=>{let e=window.setTimeout(()=>c(!0),jt);return()=>{window.clearTimeout(e)}},u=[],t[0]=l,t[1]=u):(l=t[0],u=t[1]),(0,kt.useEffect)(l,u);let d=M(),{colorClass:f,sizeClass:p,iconColorClass:m}=mt[a||!s?`ON`:`OFF`],h;t[2]!==d||t[3]!==a||t[4]!==o?(h=o?d.formatMessage(Nt.microphoneMuted):a?d.formatMessage(Nt.microphoneOff):d.formatMessage(Nt.microphoneOn),t[2]=d,t[3]=a,t[4]=o,t[5]=h):h=t[5];let g=h,_=!a,v;t[6]===_?v=t[7]:(v={isOnAfterRelease:_},t[6]=_,t[7]=v);let y=n&&s,b;t[8]!==f||t[9]!==p?(b=T(f,p),t[8]=f,t[9]=p,t[10]=b):b=t[10];let x;return t[11]!==m||t[12]!==i||t[13]!==r||t[14]!==g||t[15]!==v||t[16]!==y||t[17]!==b?(x=(0,At.jsx)(He,{"aria-label":g,buttonSound:v,onClick:r,icon:_e,iconSize:`icon-md`,disabled:y,className:b,iconColor:m,tooltipPrimaryLabel:g,tooltipSecondaryLabel:i}),t[11]=m,t[12]=i,t[13]=r,t[14]=g,t[15]=v,t[16]=y,t[17]=b,t[18]=x):x=t[18],x},Nt=te({microphoneMuted:{id:`integrated-ux.mute-button.microphone-muted`,defaultMessage:`Microphone muted in system settings / hardware switch`},microphoneOff:{id:`integrated-ux.mute-button.microphone-off`,defaultMessage:`Turn off microphone`},microphoneOn:{id:`integrated-ux.mute-button.microphone-on`,defaultMessage:`Turn on microphone`}})})),Ft,It,Lt,Rt=e((()=>{Ft=j(),Le(),L(),p(),Pt(),It=P(),Lt=()=>{"use forget";let e=(0,Ft.c)(6),{isMuting:t,toggleMute:n}=ke(),{disconnectPending:r}=Be(),{forceMuted:i,active:a,label:o,granted:s}=E(),c=t||r||i||!s,l=s&&a,u;return e[0]!==i||e[1]!==o||e[2]!==c||e[3]!==l||e[4]!==n?(u=(0,It.jsx)(Mt,{disabled:c,onClick:n,microphoneActive:l,microphoneForceMuted:i,microphoneLabel:o}),e[0]=i,e[1]=o,e[2]=c,e[3]=l,e[4]=n,e[5]=u):u=e[5],u}})),zt,Bt,Vt,Q,Ht=e((()=>{zt=j(),h(),ve(),ge(),z(),C(),N(),gt(),Bt=P(),Vt=e=>{"use forget";let t=(0,zt.c)(14),{waiting:n,started:r,onClick:i}=e,a=M(),o;t[0]!==a||t[1]!==r||t[2]!==n?(o=n?a.formatMessage(Q.screensharePending):r?a.formatMessage(Q.screenshareOn):a.formatMessage(Q.screenshareOff),t[0]=a,t[1]=r,t[2]=n,t[3]=o):o=t[3];let s=o,{colorClass:c,sizeClass:l,iconColorClass:u}=ht[r?`ON`:`OFF`],d=n?w:r?Ce:ye,f;t[4]!==c||t[5]!==l?(f=T(c,l),t[4]=c,t[5]=l,t[6]=f):f=t[6];let p;return t[7]!==d||t[8]!==u||t[9]!==i||t[10]!==s||t[11]!==f||t[12]!==n?(p=(0,Bt.jsx)(He,{"aria-label":s,onClick:i,disabled:n,icon:d,iconSize:`icon-md`,className:f,iconColor:u}),t[7]=d,t[8]=u,t[9]=i,t[10]=s,t[11]=f,t[12]=n,t[13]=p):p=t[13],p},Q=te({screenshareOff:{id:`integrated-ux.screenshare-button.screenshare-off`,defaultMessage:`Activate screenshare`},screenshareOn:{id:`integrated-ux.screenshare-button.screenshare-on`,defaultMessage:`Turn off screenshare`},screensharePending:{id:`integrated-ux.screenshare-button.pending`,defaultMessage:`Pending screenshare activation`}})})),Ut,Wt,Gt,Kt=e((()=>{Ut=j(),L(),I(),Ht(),Wt=P(),Gt=()=>{"use forget";let e=(0,Ut.c)(7),{screenshareTrackState:t,toggleScreenShare:n}=De(),r;e[0]===Symbol.for(`react.memo_cache_sentinel`)?(r=[Ne.Starting,Ne.Stopping],e[0]=r):r=e[0];let i=r.includes(t),a=t===Ne.Started,o;e[1]===n?o=e[2]:(o=()=>n(`ControlButton`),e[1]=n,e[2]=o);let s;return e[3]!==a||e[4]!==o||e[5]!==i?(s=(0,Wt.jsx)(Vt,{waiting:i,started:a,onClick:o}),e[3]=a,e[4]=o,e[5]=i,e[6]=s):s=e[6],s}}));function qt(e){return e.server.connectionState}var Jt,$,Yt,Xt=e((()=>{Jt=j(),_(),Me(),y(),pe(),Fe(),je(),r(),z(),L(),ae(),c(),ce(),Dt(),Rt(),Kt(),$=P(),Yt=e=>{"use forget";let t=(0,Jt.c)(23),{buttonClassName:r,isComposerSubmitDisabled:i,isComposerSubmitPending:a,onComposerSubmit:o}=e,s=se(),c=we(),l;t[0]===c.conversation?l=t[1]:(l=c.conversation??S(d),t[0]=c.conversation,t[1]=l);let u=l,f=ue(),p;t[2]===c?p=t[3]:(p=()=>Oe(c),t[2]=c,t[3]=p);let m=!n(p),h=n(f.hasUploadInProgress$),g;t[4]===f?g=t[5]:(g=()=>f.files$().length>0,t[4]=f,t[5]=g);let _=n(g),v=m||h||_,y=R(qt),b;t[6]!==y||t[7]!==s?(b=async()=>{oe({type:`STOP`,reason:await x({connectionState:y,isLimitExceeded:s})})},t[6]=y,t[7]=s,t[8]=b):b=t[8];let C=b,w;t[9]===v?w=t[10]:(w=!v&&(0,$.jsxs)($.Fragment,{children:[(0,$.jsx)(Ve,{capability:`screenshare`,children:(0,$.jsx)(Gt,{})}),(0,$.jsx)(Lt,{})]}),t[9]=v,t[10]=w);let T;t[11]!==r||t[12]!==c||t[13]!==v||t[14]!==u||t[15]!==C||t[16]!==i||t[17]!==a||t[18]!==o?(T=v?(0,$.jsx)(Pe,{buttonClassName:r,onSubmit:o,composerController:c,conversation:u,isStreaming:!1,isDisabled:i,showSpinner:a}):(0,$.jsx)(Et,{onClick:C}),t[11]=r,t[12]=c,t[13]=v,t[14]=u,t[15]=C,t[16]=i,t[17]=a,t[18]=o,t[19]=T):T=t[19];let E;return t[20]!==w||t[21]!==T?(E=(0,$.jsxs)(`div`,{className:`flex flex-row gap-2`,children:[w,T]}),t[20]=w,t[21]=T,t[22]=E):E=t[22],E}}));function Zt(e){return e.isVoiceModeActive}var Qt,$t,en;e((()=>{Qt=j(),Xt(),L(),$t=P(),en=e=>{"use forget";let t=(0,Qt.c)(6),{buttonClassName:n,isFocused:r,isComposerSubmitDisabled:i,isComposerSubmitPending:a,onComposerSubmit:o}=e;if(!R(Zt))return null;let s;return t[0]!==n||t[1]!==i||t[2]!==a||t[3]!==r||t[4]!==o?(s=(0,$t.jsx)(Yt,{buttonClassName:n,composerIsFocused:r,isComposerSubmitDisabled:i,isComposerSubmitPending:a,onComposerSubmit:o}),t[0]=n,t[1]=i,t[2]=a,t[3]=r,t[4]=o,t[5]=s):s=t[5],s}}))();export{en as WrapperSpeechActiveContainer};
//# sourceMappingURL=da6c1aaf-mmnve0w7123uwzll.js.map