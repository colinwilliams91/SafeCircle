class SafeCircleConfig:
    def __init__(
        self,
        enable_guardian_view: bool = True,
        enable_anonymous_reporting: bool = True,
        metadata_minimization: bool = True,
        privacy_mode: str = "strict",
    ):
        self.enable_guardian_view = enable_guardian_view
        self.enable_anonymous_reporting = enable_anonymous_reporting
        self.metadata_minimization = metadata_minimization
        self.privacy_mode = privacy_mode
