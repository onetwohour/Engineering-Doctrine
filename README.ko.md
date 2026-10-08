# Engineering Doctrine

[English](README.md) · [简体中文](README.zh-CN.md) · **한국어**

**Engineering Doctrine**은 Claude Code가 소프트웨어를 수정하기 전에 문제의 원인과 책임을 파악하고, 기존 설계를 존중하며, 필요한 범위만 변경하고, 실제 검증 결과를 바탕으로 작업을 마무리하도록 돕는 엔지니어링 규범 플러그인입니다.

## 설치

```bash
claude plugin marketplace add onetwohour/claude-plugins
claude plugin install engineering-doctrine@onetwohour
```

설치 후 Claude Code 세션을 새로 시작하면 됩니다.

## 사용법

별도 명령어 없이 평소처럼 작업을 요청하면 됩니다.

```text
로그인 후 간헐적으로 세션이 풀리는 원인을 찾아서 고쳐줘.
```

```text
이 모듈의 소유권 구조를 분석하고 필요한 경우 리팩터링해줘.
```

```text
이 버그를 재현하고 수정한 뒤 회귀 테스트까지 추가해줘.
```

작업의 성격에 따라 관련 지침을 선택합니다. 단순한 국소 변경은 가볍게 처리하고, 아키텍처·상태·보안·데이터·동시성·마이그레이션에 영향을 주는 변경은 더 깊게 검토하도록 안내합니다.

## 핵심 원칙

- **변경 전에 이해하기:** 증상이 아닌 원인과 책임, 상태, 실패 경로를 확인합니다.
- **기존 설계 존중하기:** 같은 책임을 수행하는 별도의 관리 체계나 상태 정본을 불필요하게 만들지 않습니다.
- **필요한 범위만 수정하기:** 변경 근거를 분명히 하고 기존 작업과 데이터를 보호합니다.
- **실제 동작 검증하기:** 관련 검사를 실행하고 실패 상황을 확인하며 추측과 관찰 결과를 구분합니다.
- **완료 전에 다시 검토하기:** 최종 변경 내용과 검증 근거를 확인하고 입증된 사실을 정확하게 보고합니다.

## 전체 규범

상세한 규칙은 [Engineering Doctrine 원문](doctrine/ENGINEERING_DOCTRINE.md)에서 확인할 수 있습니다.

## 로컬 사용

플러그인을 설치하지 않고 저장소에서 직접 실행할 수도 있습니다.

```bash
git clone https://github.com/onetwohour/Engineering-Doctrine.git
claude --plugin-dir ./Engineering-Doctrine/plugin
```

`--plugin-dir` 옵션은 현재 세션에만 적용됩니다.

## 기여 안내

빌드·생성·검증 방법은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 라이선스

[Apache-2.0](LICENSE)
