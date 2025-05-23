import{r as l,j as e,S as W,q as X,s as Z,v as _,w as M}from"./vendor-DzOMOknb.js";import{B as v}from"./button-Bi-VVE6s.js";import{I as L,B as ee}from"./BranchIcon-CSii4L6V.js";import{S as se}from"./scroll-area-O0MtktIu.js";import{c,T as C,a as w,b as N,d as y}from"./App-C3ktLmdI.js";import{A as b,a as A,b as D,c as T,d as $,e as R,f as S,g as B,h as O}from"./alert-dialog-BB8iq4uH.js";import"./index-C1MHA_mz.js";const me=({branches:U,onSwitchBranch:q,onDeleteBranch:H,onUpdateCurrentBranch:P,onScrollEnd:m,hasMore:o=!1,className:x,isLoading:a=!1,isUpdatingCurrentBranch:d=!1,onReloadLocalBranches:re})=>{const[k,Y]=l.useState(""),[G,u]=l.useState(null),[J,f]=l.useState(!1),[j,n]=l.useState({}),K=l.useRef(null),p=l.useRef(null),i=l.useRef(null);l.useEffect(()=>{(a||d)&&n({})},[a,d]);const g=(s,r)=>{a||d||n(t=>({...t,[r]:s}))},h=(s=>{const r={main:0,master:1,develop:2,staging:3};return[...s].sort((t,E)=>{const F=r[t.name]??999,Q=r[E.name]??999;return F!==Q?F-Q:t.name.localeCompare(E.name)})})(U),V=h.length>0||a,z=h.map(s=>({...s,isCurrent:s.isCurrent!==void 0?s.isCurrent:s.current})).filter(s=>s.name.toLowerCase().includes(k.toLowerCase())),I=l.useCallback(()=>{!o||!m||!p.current||(i.current&&i.current.disconnect(),i.current=new IntersectionObserver(s=>{const[r]=s;r.isIntersecting&&o&&!a&&m()},{threshold:.5}),i.current.observe(p.current))},[o,m,a]);return l.useEffect(()=>(I(),()=>{i.current&&i.current.disconnect()}),[I,z.length]),a&&h.length===0?e.jsx("div",{className:c("w-full",x),children:e.jsx("div",{className:"animate-pulse space-y-3",children:[1,2,3,4,5].map(s=>e.jsx("div",{className:"h-14 bg-gray-200 rounded"},s))})}):h.length===0&&!a?e.jsx("div",{className:c("w-full p-4 text-center text-gray-500",x),children:"No branches found"}):e.jsxs("div",{className:c("w-full flex flex-col",x),children:[V&&e.jsx("div",{className:"flex items-center justify-between mb-4",children:e.jsxs("div",{className:"relative flex-1 mr-2",children:[e.jsx(W,{className:"absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"}),e.jsx(L,{type:"text",placeholder:"Search local branches...",value:k,onChange:s=>Y(s.target.value),className:"pl-9 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"})]})}),e.jsx(se,{ref:K,className:"h-[calc(100vh-24rem)] overflow-auto pr-2 flex-1",children:e.jsxs("div",{className:"space-y-2",children:[z.map(s=>e.jsxs("div",{className:c("branch-item p-3 rounded-md border",s.isCurrent?"border-green-300 bg-green-50 hover:bg-green-50":"border-gray-200 hover:bg-gray-50"),children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(ee,{branchName:s.name,hasRemote:s.hasRemote}),e.jsxs("span",{className:c("font-medium",s.isCurrent?"font-semibold":"",s.hasRemote?"":"line-through text-gray-500"),children:[s.name,s.isCurrent&&e.jsx("span",{className:"ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full",children:"current"})]})]}),e.jsx("div",{className:"flex space-x-2",children:s.isCurrent?s.hasRemote&&e.jsx(C,{children:e.jsxs(w,{open:j[`update-${s.name}`],onOpenChange:r=>g(r,`update-${s.name}`),children:[e.jsx(N,{asChild:!0,children:e.jsx("span",{children:e.jsxs(b,{open:J,onOpenChange:r=>{f(r),r||n(t=>({...t,[`update-${s.name}`]:!1}))},children:[e.jsx(A,{asChild:!0,children:e.jsx(v,{size:"sm",onClick:()=>{f(!0),n(r=>({...r,[`update-${s.name}`]:!1}))},variant:"secondary",className:"flex items-center bg-green-50 hover:bg-green-100 border-green-200 text-green-700",children:e.jsx(X,{size:16,className:d?"animate-spin":""})})}),e.jsxs(D,{children:[e.jsxs(T,{children:[e.jsx($,{children:"Update current branch?"}),e.jsx(R,{children:"This will fetch and update the current branch from its remote counterpart."})]}),e.jsxs(S,{children:[e.jsx(B,{onClick:()=>{n(r=>({...r,[`update-${s.name}`]:!1}))},children:"Cancel"}),e.jsx(O,{onClick:()=>{f(!1),n(r=>({...r,[`update-${s.name}`]:!1})),P()},children:"Update"})]})]})]})})}),e.jsx(y,{children:e.jsx("p",{children:"Update this branch"})})]})}):e.jsxs(e.Fragment,{children:[e.jsx(C,{children:e.jsxs(w,{open:j[`delete-${s.name}`],onOpenChange:r=>g(r,`delete-${s.name}`),children:[e.jsx(N,{asChild:!0,children:e.jsx("span",{children:e.jsxs(b,{onOpenChange:r=>{r||n(t=>({...t,[`delete-${s.name}`]:!1}))},children:[e.jsx(A,{asChild:!0,children:e.jsx(v,{variant:"secondary",size:"sm",onClick:()=>{n(r=>({...r,[`delete-${s.name}`]:!1}))},className:"flex items-center bg-red-50 hover:bg-red-100 border-red-200 text-red-600",children:e.jsx(Z,{size:16})})}),e.jsxs(D,{children:[e.jsxs(T,{children:[e.jsxs($,{children:["Are you sure you want to delete ",e.jsx("span",{className:"font-mono",children:s.name}),"?"]}),e.jsx(R,{children:"This will permanently delete the branch."})]}),e.jsxs(S,{children:[e.jsx(B,{children:"Cancel"}),e.jsx(O,{onClick:()=>{n(r=>({...r,[`delete-${s.name}`]:!1})),H(s.name)},children:"Delete"})]})]})]})})}),e.jsx(y,{children:e.jsx("p",{children:"Delete this branch"})})]})}),e.jsx(C,{children:e.jsxs(w,{open:j[`switch-${s.name}`],onOpenChange:r=>g(r,`switch-${s.name}`),children:[e.jsx(N,{asChild:!0,children:e.jsx("span",{children:e.jsxs(b,{open:G===s.name,onOpenChange:r=>{u(r?s.name:null),r||n(t=>({...t,[`switch-${s.name}`]:!1}))},children:[e.jsx(A,{asChild:!0,children:e.jsx(v,{variant:"secondary",size:"sm",onClick:()=>{u(s.name),n(r=>({...r,[`switch-${s.name}`]:!1}))},className:"flex items-center bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",children:e.jsx(_,{size:16})})}),e.jsxs(D,{children:[e.jsxs(T,{children:[e.jsxs($,{children:["Switch to branch ",e.jsx("span",{className:"font-mono",children:s.name}),"?"]}),e.jsx(R,{children:"You will switch your working directory to this branch."})]}),e.jsxs(S,{children:[e.jsx(B,{children:"Cancel"}),e.jsx(O,{onClick:()=>{u(null),n(r=>({...r,[`switch-${s.name}`]:!1})),q(s.name)},children:"Switch"})]})]})]})})}),e.jsx(y,{children:e.jsx("p",{children:"Change to this branch"})})]})})]})})]}),!s.hasRemote&&e.jsxs("div",{className:"mt-2 flex items-center text-xs text-amber-600",children:[e.jsx(M,{size:14,className:"mr-1"}),e.jsx("span",{children:"This branch no longer exists on the remote."})]})]},s.name)),o&&e.jsx("div",{ref:p,className:"py-4 flex justify-center",children:a?e.jsx("div",{className:"animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"}):e.jsx("div",{className:"h-5 w-5"})})]})})]})};export{me as default};
